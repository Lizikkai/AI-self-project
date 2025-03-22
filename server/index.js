require('dotenv').config()
const { message } = require('ant-design-vue');
const express = require("express");
const jwt = require('jsonwebtoken');
const mysql = require("mysql2/promise");
const app = express();

// 添加 CORS 中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 创建数据库连接池
const pool = mysql.createPool({
  // 47.236.137.139
  host: "47.236.137.139",
  user: "root", // 替换为你的MySQL用户名
  password: "mysql_hSAz7i", // 替换为你的MySQL密码
  database: "user_info", // 替换为你的数据库名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 启动保活机制
  enableKeepAlive: true,
  // 空闲连接
  keepAliveInitialDelay: 10000,
  // 连接超时时间
  connectTimeout: 10000,
});

pool.on('error', function(err) {
  console.log('db error', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
    // 重新连接
    handleDisconnect();
  } else {
    throw err;
  }
});

function handleDisconnect() {
  // 重新建立连接的逻辑
  pool.getConnection().then(connection => {
    console.log("数据库重连成功");
    connection.release();
  }).catch(err => {
    console.log("数据库重连失败",err);
    setTimeout(handleDisconnect, 2000);
  });
}

/** 中间件 校验token是否已过期 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  // 移除可能重复的 Bearer 前缀
  const token = authHeader && authHeader.replace(/^Bearer\s+Bearer\s+/, 'Bearer ').split(' ')[1];
  if(!token) {
    return res.status(401).json({
      code:1,
      message:'登录信息失效',
      content: null
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      code: 1,
      message: '登录已过期',
      content: null
    });
  }
}



/**
 * 中间件 - 解析JSON请求体
 * 例如:当前端端发送的Post 请求 { "name": "张三", "password": "123456" }
 * 这个中间件会自动将 JSON 字符串转换为 JavaScript 对象，
 * 让我们可以通过 req.body 直接访问
 */
app.use(express.json());
/**
 * 中间件 - 解析URL编码的请求体
 * 例如：表单提交的数据格式：name=张三&password=123456
 * extended: true 表示可以解析更复杂的对象和数组
 * 让我们可以通过 req.body 访问这些数据
 */
app.use(express.urlencoded({ extended: true }));

/**
 * 静态文件服务
 * 例如：如果在 public 文件夹下有 images/logo.png
 */
app.use(express.static("public"));

/** 登录 */
app.post("/api/login", async (req, res) => {
  // res.setHeader("Content-type", "text/json;charset=UTF-8");
  try {
    const { name, password } = req.body;
    // 验证前端提交的数据是否有用户名或者密码
    if (!name || !password) {
      return res.status(400).json({
        code: 1,
        message: "用户名或者密码不能为空",
        content: null
      });
    }
    const [rows] = await pool.query(
      "SELECT * FROM user_info.info WHERE name = ? AND password = ?",
      [name, password]
    );
    if (rows.length > 0) {
      const token = jwt.sign({
        userId: rows[0].id,
        name: rows[0].name,
        password: rows[0].password,
        email: rows[0].email,
        mobile: rows[0].mobile
      }, process.env.JWT_SECRET, {
        expiresIn: "1h"
      })
      res.setHeader("Authorization", `Bearer ${token}`)
      return res.status(200).json({
        code: 0,
        message: "登录成功",
        content: {
          userId: rows[0].id,
          name: rows[0].name,
          password: rows[0].password,
          email: rows[0].email,
          mobile: rows[0].mobile,
          isAdmin: rows[0].isAdmin
        }
      });
    } else {
      res.status(401).json({
        code: 1,
        message: "用户名或者密码错误",
        content: null
      });
    }
  } catch (error) {
    console.log("error",error)
    return res.status(500).json({
      code: 1,
      message: "登录过程中发生错误",
      content: null
    });
  }
});

/** 注册 */
app.post("/api/register", async(req,res) => {
  try {
    const { name, password, email, mobile } = req.body;
    const wrongLabel = !name ? 'name' : !password ? 'password' : !mobile ? 'mobile' : 'email'
    if(!name || !password || !email || !mobile) {
      return res.status(400).json({
        code:1,
        message: `${wrongLabel}不能为空`,
        content: null
      })
    }
    // console.log("开始查询数据库");
    // console.log("查询参数:", { mobile, email });
    const [rows] = await pool.query(
      "SELECT * FROM user_info.info WHERE mobile = ? OR email = ?", 
      [mobile, email]
    )
    if(rows.length > 0) {
      // 检查是否已存在相同的手机号或邮箱
      const existingUser = rows[0];
      if(existingUser.mobile === mobile) {
        return res.status(400).json({
          code:1,
          message: "该手机号已被注册",
          content: null
        })
      }
      if(existingUser.email === email) {
        return res.status(400).json({
          code:1,
          message: "该邮箱已被注册",
          content: null
        })
      }
    }
    // 加入新用户
    const [insertResult] = await pool.query(
      "INSERT INTO user_info.info (name, password, email, mobile) VALUES (?, ?, ?, ?)",
      [name, password, email, mobile]
    )
    if(insertResult.affectedRows === 1) {
      const token = jwt.sign({
        userId: insertResult.insertId,
        name: name,
        password: password,
        email: email,
        mobile: mobile
      }, process.env.JWT_SECRET, {
        expiresIn: "1h"
      })
      res.setHeader("Authorization", `Bearer ${token}`)
      return res.status(200).json({
        code: 0,
        message: "注册成功",
        content: {
          userId: insertResult.insertId,
          name: name,
          password: password,
          email: email,
          mobile: mobile,
          isAdmin: false
        }
      })
    }
    // 检查用户名
  } catch (error) {
    console.log("error",error)
    return res.status(500).json({
      code: 1,
      message: "注册过程中发生错误",
      content: null
    });
  }
})


/** 更新个人信息 */
app.post('/api/user/update', verifyToken,async (req,res) => {
  try {
    const { name, email, mobile, password, isAdmin } = req.body;
    console.log("isAdmin",isAdmin)
    const userId = req.user.userId; // 从token中获取用户ID;
    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    if(name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if(email) {
      updateFields.push('email =?');
      updateValues.push(email);
    }
    if(mobile) {
      updateFields.push('mobile =?');
      updateValues.push(mobile);
    }
    if(password) {
      updateFields.push('password =?');
      updateValues.push(password);
    }
    if(typeof isAdmin === 'number') {
      updateFields.push('isAdmin =?');
      updateValues.push(isAdmin);
    }else {
      return res.status(400).json({
        code: 1,
        message: "是否管理员参数错误",
        content: null
      })
    }
    // 添加用户ID到更新值数组
    updateValues.push(userId);
    const [result] = await pool.query(
      `UPDATE user_info.info SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    if(result.affectedRows === 1) {
      return res.status(200).json({
        code: 0,
        message: "个人信息更新成功",
        content: null
      })
    }else {
      return res.status(400).json({
        code: 1,
        message: "更新失败，未找到对应用户",
        content: null
      });
    }

  } catch (error) {
    return res.status(500).json({
      code: 1,
      message: '服务器错误,请稍后再试',
      content: null
    });
  }
})

/** 获取用户的列表 仅管理员可以做新增成员,删除成员的操作 */
app.get('/api/user/list', verifyToken, async (req,res) => {
  try {
    const [user] = await pool.query(
      "SELECT id, name, email, mobile, isAdmin FROM user_info.info"
    )
    // console.log("user",user)
    if(user.length > 0) {
      return res.status(200).json({
        code: 0,
        message: "获取用户列表成功",
        content: user
      })
    }
  } catch (error) {
    return res.status(500).json({
      code: 1,
      message: "获取用户列表失败",
      content: user
    })
  }
})

// 通过个人的用户id获取个人信息接口
app.get('/api/user/personal', verifyToken, async (req,res) => {
  try {
    // console.log("req",req)
    const { id } = req.query; // 从url中获取参数
    const [rows] = await pool.query(
      "SELECT id, name, email, mobile, password, isAdmin FROM user_info.info WHERE id = ?", [id]
    )
    if(rows.length > 0) {
      return res.status(200).json({
        code: 0,
        message: "获取用户信息成功",
        content: rows[0]
      })
    }
  } catch (error) {
    return res.status(500).json({
      code: 1,
      message: "获取用户信息失败",
      content: null
    })
  }
})

app.post('/api/admin/update', verifyToken, async(req, res) => {
  try {
    const { id, name, email, mobile, password, isAdmin } = req.body;
    // 验证是否为管理员
    const adminId = req.user.userId;
    const [adminCheck] = await pool.query(
      "SELECT isAdmin FROM user_info.info WHERE id =?", [adminId]
    )
    console.log("admin",adminCheck)
    if(!adminCheck.length || adminCheck[0].isAdmin !== 1) {
      return res.status(403).json({
        code: 1,
        message: "仅管理员可修改用户信息",
        content: null
      })
    }
    if(!id) {
      return res.status(400).json({
        code: 1,
        message: "用户id不能为空",
        content: null
      })
    }
    // 构建更新字段
    const updateFields = [];
    const updateValues = [];
    if(name) {
      updateFields.push('name =?');
      updateValues.push(name);
    }
    if(email) {
      updateFields.push('email =?');
      updateValues.push(email);
    }
    if(mobile) {
      updateFields.push('mobile =?');
      updateValues.push(mobile);
    }
    if(password) {
      updateFields.push('password =?');
      updateValues.push(password);
    }
    if(typeof isAdmin === 'number') {
      updateFields.push('isAdmin =?');
      updateValues.push(isAdmin);
    }else {
      return res.status(400).json({
        code: 1,
        message: "是否管理员参数错误",
        content: null
      })
    }
    // 添加用户ID到更新值数组
    updateValues.push(id);
    const [result] = await pool.query(
      `UPDATE user_info.info SET ${updateFields.join(', ')} WHERE id =?`,
      updateValues
    );
    console.log("result",result)
    if(result.affectedRows === 1) {
      return res.status(200).json({
        code: 0,
        message: "个人信息更新成功",
        content: null
      })
    }else {
      return res.status(400).json({
        code: 1,
        message: "更新失败，未找到对应用户",
        content: null
      });
    }
  } catch (error) {
    return res.status(500).json({
      code: 1,
      message: '服务器错误,请稍后再试',
      content: null
    });
  }
})

app.delete('/api/admin/delete', verifyToken, async(req,res) => {
  try {
    const { id } = req.query;
    // 验证是否为管理员
    const adminId = req.user.userId;
    const [adminCheck] = await pool.query(
      "SELECT isAdmin FROM user_info.info WHERE id =?", [adminId]
    )
    if(!adminCheck.length || adminCheck[0].isAdmin !== 1) {
      return res.status(403).json({
        code: 1,
        message: "仅管理员可删除用户",
        content: null
      })
    }
    if(!id) {
      return res.status(400).json({
        code: 1,
        message: "用户id不能为空",
        content: null
      })
    }
    const [result] = await pool.query(
      "DELETE FROM user_info.info WHERE id =?", [id]
    )
    if(result.affectedRows === 1) {
      return res.status(200).json({
        code: 0,
        message: "用户删除成功",
        content: null
      })
    }
  } catch (error) {
    return res.status(500).json({
      code: 1,
      message: '服务器错误,请稍后再试',
      content: null
    });
  }
})

// 启动服务器
app.listen(14258,() => {
  console.log(`服务器运行`);
});

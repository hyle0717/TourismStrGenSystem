// 导入Cypress命令
import './commands'

// 全局错误处理
Cypress.on('uncaught:exception', (err, runnable) => {
  // 返回false防止Cypress因未捕获的异常而失败
  return false
})

// 全局配置
beforeEach(() => {
  // 在每个测试之前执行的代码
  cy.viewport(1280, 720)
  
  // 模拟路由守卫
  cy.intercept('GET', '/home', (req) => {
    const token = localStorage.getItem('token')
    if (!token) {
      req.reply({
        statusCode: 401,
        body: { error: '未授权' }
      })
    } else {
      req.reply({
        statusCode: 200
      })
    }
  })
}) 
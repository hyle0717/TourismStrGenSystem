// 登录命令
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login')
  cy.get('input[placeholder="用户名"]').type(username)
  cy.get('input[placeholder="密码"]').type(password)
  cy.get('button').contains('登录').click()
})

// 等待加载完成
Cypress.Commands.add('waitForLoading', () => {
  cy.get('.el-loading-mask', { timeout: 10000 }).should('not.exist')
})

// 检查错误消息
Cypress.Commands.add('checkErrorMessage', (message) => {
  cy.get('.el-message').should('contain', message)
}) 
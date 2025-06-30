describe('注册页面测试', () => {
  beforeEach(() => {
    cy.visit('/register')
    // 清除localStorage
    cy.clearLocalStorage()
  })

  it('页面加载完整性', () => {
    // 检查页面元素是否存在
    cy.get('input[placeholder="用户名"]').should('exist')
    cy.get('input[placeholder="邮箱"]').should('exist')
    cy.get('input[placeholder="手机号"]').should('exist')
    cy.get('input[placeholder="密码"]').should('exist')
    cy.get('input[placeholder="确认密码"]').should('exist')
    cy.get('button').contains('注册').should('exist')
    cy.get('a').contains('立即登录').should('exist')
  })

  it('表单验证 - 必填字段', () => {
    cy.get('button').contains('注册').click()
    
    // 检查所有必填字段的错误提示
    cy.get('form').within(() => {
      // 用户名
      cy.get('input[placeholder="用户名"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '请输入用户名')
      // 邮箱
      cy.get('input[placeholder="邮箱"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '请输入邮箱地址')
      // 手机号
      cy.get('input[placeholder="手机号"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '请输入手机号')
      // 密码
      cy.get('input[placeholder="密码"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '请输入密码')
      // 确认密码
      cy.get('input[placeholder="确认密码"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '请再次输入密码')
    })
  })

  it('表单验证 - 用户名长度', () => {
    // 输入过短的用户名
    cy.get('input[placeholder="用户名"]').type('ab')
    cy.get('button').contains('注册').click()
    
    // 检查错误提示
    cy.get('input[placeholder="用户名"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '长度在 3 到 20 个字符')
  })

  it('表单验证 - 邮箱格式', () => {
    // 输入无效的邮箱
    cy.get('input[placeholder="邮箱"]').type('invalid-email')
    cy.get('button').contains('注册').click()
    
    // 检查错误提示
    cy.get('input[placeholder="邮箱"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '请输入正确的邮箱地址')
  })

  it('表单验证 - 手机号格式', () => {
    // 输入无效的手机号
    cy.get('input[placeholder="手机号"]').type('1234567890')
    cy.get('button').contains('注册').click()
    
    // 检查错误提示
    cy.get('input[placeholder="手机号"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '请输入正确的手机号')
  })

  it('表单验证 - 密码长度', () => {
    // 输入过短的密码
    cy.get('input[placeholder="密码"]').type('1234567')
    cy.get('button').contains('注册').click()
    
    // 检查错误提示
    cy.get('input[placeholder="密码"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '密码长度不能小于8位')
  })

  it('表单验证 - 密码一致性', () => {
    // 输入不一致的密码
    cy.get('input[placeholder="密码"]').type('12345678')
    cy.get('input[placeholder="确认密码"]').type('87654321')
    cy.get('button').contains('注册').click()
    
    // 检查错误提示
    cy.get('input[placeholder="确认密码"]').closest('.el-form-item').find('.el-form-item__error').should('contain', '两次输入密码不一致!')
  })

  it('注册成功', () => {
    // 拦截注册API请求
    cy.intercept('POST', 'http://localhost:8000/api/users/register/', {
      statusCode: 200,
      body: {
        token: {
          access: 'mock-token'
        }
      }
    }).as('registerRequest')

    // 填写所有必填字段
    cy.get('input[placeholder="用户名"]').type('testuser')
    cy.get('input[placeholder="邮箱"]').type('test@example.com')
    cy.get('input[placeholder="手机号"]').type('13800138000')
    cy.get('input[placeholder="密码"]').type('12345678')
    cy.get('input[placeholder="确认密码"]').type('12345678')

    // 提交表单
    cy.get('button').contains('注册').click()

    // 等待API请求完成
    cy.wait('@registerRequest')

    // 检查成功消息
    cy.get('.el-message--success').should('contain', '注册成功')

    // 检查是否跳转到首页
    cy.url().should('include', '/')
  })

  it('注册失败 - 用户名已存在', () => {
    // 拦截注册API请求，模拟用户名已存在
    cy.intercept('POST', 'http://localhost:8000/api/users/register/', {
      statusCode: 400,
      body: {
        username: ['用户名已存在']
      }
    }).as('registerRequest')

    // 填写所有必填字段
    cy.get('input[placeholder="用户名"]').type('existinguser')
    cy.get('input[placeholder="邮箱"]').type('test@example.com')
    cy.get('input[placeholder="手机号"]').type('13800138000')
    cy.get('input[placeholder="密码"]').type('12345678')
    cy.get('input[placeholder="确认密码"]').type('12345678')

    // 提交表单
    cy.get('button').contains('注册').click()

    // 等待API请求完成
    cy.wait('@registerRequest')

    // 检查错误消息
    cy.get('.el-message--error').should('contain', '用户名已存在')
  })

  it('注册失败 - 网络错误', () => {
    // 拦截注册API请求，模拟网络错误
    cy.intercept('POST', 'http://localhost:8000/api/users/register/', {
      forceNetworkError: true
    }).as('registerRequest')

    // 填写所有必填字段
    cy.get('input[placeholder="用户名"]').type('testuser')
    cy.get('input[placeholder="邮箱"]').type('test@example.com')
    cy.get('input[placeholder="手机号"]').type('13800138000')
    cy.get('input[placeholder="密码"]').type('12345678')
    cy.get('input[placeholder="确认密码"]').type('12345678')

    // 提交表单
    cy.get('button').contains('注册').click()

    // 等待API请求完成
    cy.wait('@registerRequest')

    // 等待错误消息出现
    cy.wait(1000)

    // 检查错误消息
    cy.get('.el-message--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', '注册失败，请稍后重试')
  })
}) 
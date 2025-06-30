describe('旅游攻略规划功能测试', () => {
  beforeEach(() => {
    // 先访问登录页面
    cy.visit('/login')
    
    // 拦截登录API请求
    cy.intercept('POST', 'http://localhost:8000/api/users/login/', {
      statusCode: 200,
      body: {
        token: {
          access: 'mock-token'
        },
        user: {
          id: 1,
          username: 'hyle',
          email: 'test@example.com',
          phone: '13800138000'
        }
      }
    }).as('loginRequest')

    // 输入登录信息
    cy.get('input[placeholder="用户名"]').type('hyle')
    cy.get('input[placeholder="密码"]').type('chl12345678')
    cy.get('button').contains('登录').click()

    // 等待登录请求完成
    cy.wait('@loginRequest')

    // 检查是否登录成功
    cy.window().its('localStorage.token').should('exist')
    cy.window().its('localStorage.username').should('equal', 'hyle')

    // 访问旅游攻略规划页面
    cy.visit('/travel-planner')
  })

  it('页面加载完整性', () => {
    // 检查页面标题
    cy.get('.title').should('contain', '个性化旅游攻略规划')
    
    // 检查返回按钮
    cy.get('.back-button').should('exist')
    
    // 检查表单元素
    cy.get('input[placeholder="请输入旅游目的地"]').should('exist')
    cy.get('input[placeholder="请输入行程天数"]').should('exist')
    cy.get('.el-select').should('exist')
    cy.get('input[placeholder="请输入预算金额"]').should('exist')
    cy.get('input[placeholder="选择出行日期"]').should('exist')
    cy.get('textarea[placeholder="请输入特殊要求（如：需要无障碍通道、饮食禁忌等）"]').should('exist')
    
    // 检查提交按钮
    cy.get('button').contains('开始规划').should('exist')
    
    // 检查查看历史攻略按钮
    cy.get('button').contains('查看历史攻略').should('exist')
  })

  it('表单验证 - 必填字段', () => {
    // 直接点击提交按钮
    cy.get('button').contains('开始规划').click()
    
    // 等待表单验证完成
    cy.wait(500)
    
    // 检查错误提示
    cy.get('form').within(() => {
      // 目的地
      cy.get('.el-form-item').contains('目的地').parent().find('.el-form-item__error').should('be.visible').and('contain', '请输入目的地')
      // 行程天数
      cy.get('.el-form-item').contains('行程天数').parent().find('.el-form-item__error').should('be.visible').and('contain', '请输入行程天数')
    })
  })


  it('成功生成攻略', () => {
    // 拦截API请求
    cy.intercept('POST', 'http://localhost:8000/api/travel-planner/plan/', {
      statusCode: 200,
      body: {
        id: 1,
        destination: '北京',
        duration: 5,
        budget: 5000,
        travel_date: '2024-05-01',
        preferences: ['美食', '文化'],
        special_requirements: '无特殊要求',
        plan_content: '这是一份详细的北京旅游攻略...'
      }
    }).as('generatePlan')

    // 填写所有必填字段
    cy.get('input[placeholder="请输入旅游目的地"]').type('北京')
    cy.get('input[placeholder="请输入行程天数"]').type('5')
    
    // 选择旅行偏好
    cy.get('.el-select').click()
    cy.get('.el-select-dropdown__item').contains('美食').click({ force: true })
    cy.get('.el-select-dropdown__item').contains('文化').click({ force: true })
    // 点击页面其他位置关闭下拉菜单
    cy.get('.title').click()
    
    // 等待下拉菜单关闭
    cy.wait(500)
    
    cy.get('input[placeholder="请输入预算金额"]').type('5000')
    cy.get('input[placeholder="选择出行日期"]').type('2024-05-01')
    cy.get('textarea[placeholder="请输入特殊要求（如：需要无障碍通道、饮食禁忌等）"]').type('无特殊要求')

    // 提交表单
    cy.get('button').contains('开始规划').click()

    // 等待API请求完成
    cy.wait('@generatePlan')

    // 检查成功消息
    cy.get('.el-message--success').should('contain', '旅游攻略生成成功！')

    // 检查是否跳转到历史页面
    cy.url().should('include', '/travel-history')
  })

  it('生成攻略失败 - 服务器错误', () => {
    // 拦截API请求，模拟服务器错误
    cy.intercept('POST', 'http://localhost:8000/api/travel-planner/plan/', {
      statusCode: 500,
      body: {
        error: '服务器内部错误'
      }
    }).as('generatePlan')

    // 填写所有必填字段
    cy.get('input[placeholder="请输入旅游目的地"]').type('北京')
    cy.get('input[placeholder="请输入行程天数"]').type('5')
    
    // 选择旅行偏好
    cy.get('.el-select').click()
    cy.get('.el-select-dropdown__item').contains('美食').click({ force: true })
    cy.get('.el-select-dropdown__item').contains('文化').click({ force: true })
    // 点击页面其他位置关闭下拉菜单
    cy.get('.title').click()
    
    // 等待下拉菜单关闭
    cy.wait(500)
    
    cy.get('input[placeholder="请输入预算金额"]').type('5000')
    cy.get('input[placeholder="选择出行日期"]').type('2024-05-01')
    cy.get('textarea[placeholder="请输入特殊要求（如：需要无障碍通道、饮食禁忌等）"]').type('无特殊要求')

    // 提交表单
    cy.get('button').contains('开始规划').click()

    // 等待API请求完成
    cy.wait('@generatePlan')

    // 检查错误消息
    cy.get('.el-message--error').should('contain', '生成攻略失败：服务器内部错误')
  })

  it('生成攻略失败 - 网络服务错误', () => {
    // 拦截API请求，模拟网络错误
    cy.intercept('POST', 'http://localhost:8000/api/travel-planner/plan/', {
      forceNetworkError: true
    }).as('generatePlan')

    // 填写所有必填字段
    cy.get('input[placeholder="请输入旅游目的地"]').type('北京')
    cy.get('input[placeholder="请输入行程天数"]').type('5')
    
    // 选择旅行偏好
    cy.get('.el-select').click()
    cy.get('.el-select-dropdown__item').contains('美食').click({ force: true })
    cy.get('.el-select-dropdown__item').contains('文化').click({ force: true })
    // 点击页面其他位置关闭下拉菜单
    cy.get('.title').click()
    
    // 等待下拉菜单关闭
    cy.wait(500)
    
    cy.get('input[placeholder="请输入预算金额"]').type('5000')
    cy.get('input[placeholder="选择出行日期"]').type('2024-05-01')
    cy.get('textarea[placeholder="请输入特殊要求（如：需要无障碍通道、饮食禁忌等）"]').type('无特殊要求')

    // 提交表单
    cy.get('button').contains('开始规划').click()

    // 等待API请求完成
    cy.wait('@generatePlan')

    // 等待错误消息出现
    cy.wait(2000)

    // 检查错误消息
    cy.get('.el-message--error', { timeout: 15000 })
      .should('be.visible')
      .and('contain', '生成攻略失败：Network Error')

    // 检查按钮是否恢复可点击状态
    cy.get('button').contains('开始规划').should('not.have.attr', 'disabled')
  })
}) 
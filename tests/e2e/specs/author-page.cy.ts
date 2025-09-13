// 作者页面端到端测试
describe('作者页面测试', () => {
  beforeEach(function () {
    // 模拟钱包连接
    // @ts-ignore
    cy.mockWalletConnection();
    // 模拟作者课程数据
    // @ts-ignore
    cy.intercept('GET', '**/api/getAuthorCourses*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          title: 'Web3 开发基础',
          description: '学习 Web3 开发的基础知识',
          content: '# Web3 开发基础\n\n这是一个关于 Web3 开发的课程...',
          price: '0.1',
          author: '0x1234567890123456789012345678901234567890',
          cover: 'https://via.placeholder.com/300x200',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    }).as('getAuthorCourses');
    
    // 访问作者页面
    cy.visit('/author');
  });

  it('应该正确显示作者页面标题', () => {
    cy.get('h1').should('contain', '作者中心');
    cy.get('[data-testid="author-page"]').should('be.visible');
  });

  it('应该显示已创建的课程列表', () => {
    cy.wait('@getAuthorCourses');
    
    // 检查课程列表
    cy.get('[data-testid="author-course-card"]').should('have.length.at.least', 1);
    
    // 检查课程信息
    cy.get('[data-testid="author-course-card"]').first().within(() => {
      cy.get('[data-testid="course-title"]').should('contain', 'Web3 开发基础');
      cy.get('[data-testid="course-price"]').should('contain', '0.1 ETH');
      cy.get('[data-testid="course-created-at"]').should('be.visible');
    });
  });

  it('应该能够点击创建课程按钮', () => {
    // 点击创建课程按钮
    cy.get('[data-testid="create-course-btn"]').click();
    
    // 验证跳转到创建课程页面
    cy.url().should('include', '/create-course');
    cy.get('[data-testid="create-course-page"]').should('be.visible');
  });

  it('应该能够编辑课程', () => {
    cy.wait('@getAuthorCourses');
    
    // 点击编辑按钮
    cy.get('[data-testid="edit-course-btn"]').first().click();
    
    // 验证编辑表单
    cy.get('[data-testid="edit-course-form"]').should('be.visible');
    cy.get('[data-testid="course-title-input"]').should('have.value', 'Web3 开发基础');
  });

  it('应该能够删除课程', () => {
    cy.wait('@getAuthorCourses');
    
    // 点击删除按钮
    cy.get('[data-testid="delete-course-btn"]').first().click();
    
    // 确认删除
    cy.get('[data-testid="confirm-delete-btn"]').click();
    
    // 验证课程被删除
    cy.get('[data-testid="author-course-card"]').should('have.length', 0);
  });

  it('应该能够设置用户名', () => {
    // 点击设置用户名按钮
    cy.get('[data-testid="set-username-btn"]').click();
    
    // 输入用户名
    cy.get('[data-testid="username-input"]').type('测试作者');
    
    // 点击确认按钮
    cy.get('[data-testid="confirm-username-btn"]').click();
    
    // 验证用户名设置成功
    cy.get('[data-testid="username-display"]').should('contain', '测试作者');
  });
});

// 创建课程页面端到端测试
describe('创建课程页面测试', () => {
  beforeEach(() => {
    // 模拟钱包连接
    cy.mockWalletConnection();
    // 模拟 API 调用
    cy.intercept('POST', '**/api/createCourse', {
      statusCode: 200,
      body: { success: true, courseId: 'new-course-123' }
    }).as('createCourse');
    
    // 访问创建课程页面
    cy.visit('/create-course');
  });

  it('应该正确显示创建课程表单', () => {
    cy.get('[data-testid="create-course-page"]').should('be.visible');
    cy.get('h1').should('contain', '创建课程');
    
    // 检查表单字段
    cy.get('[data-testid="course-title-input"]').should('be.visible');
    cy.get('[data-testid="course-description-input"]').should('be.visible');
    cy.get('[data-testid="course-content-input"]').should('be.visible');
    cy.get('[data-testid="course-price-input"]').should('be.visible');
    cy.get('[data-testid="course-cover-input"]').should('be.visible');
  });

  it('应该能够填写课程信息', () => {
    // 填写课程标题
    cy.get('[data-testid="course-title-input"]').type('测试课程标题');
    
    // 填写课程描述
    cy.get('[data-testid="course-description-input"]').type('这是一个测试课程描述');
    
    // 填写课程内容
    cy.get('[data-testid="course-content-input"]').type('# 测试课程\n\n这是课程内容...');
    
    // 填写课程价格
    cy.get('[data-testid="course-price-input"]').type('0.1');
    
    // 填写课程封面
    cy.get('[data-testid="course-cover-input"]').type('https://via.placeholder.com/300x200');
    
    // 验证表单数据
    cy.get('[data-testid="course-title-input"]').should('have.value', '测试课程标题');
    cy.get('[data-testid="course-description-input"]').should('have.value', '这是一个测试课程描述');
    cy.get('[data-testid="course-content-input"]').should('have.value', '# 测试课程\n\n这是课程内容...');
    cy.get('[data-testid="course-price-input"]').should('have.value', '0.1');
    cy.get('[data-testid="course-cover-input"]').should('have.value', 'https://via.placeholder.com/300x200');
  });

  it('应该能够预览课程', () => {
    // 填写课程信息
    cy.get('[data-testid="course-title-input"]').type('测试课程标题');
    cy.get('[data-testid="course-description-input"]').type('这是一个测试课程描述');
    cy.get('[data-testid="course-content-input"]').type('# 测试课程\n\n这是课程内容...');
    cy.get('[data-testid="course-price-input"]').type('0.1');
    cy.get('[data-testid="course-cover-input"]').type('https://via.placeholder.com/300x200');
    
    // 点击预览按钮
    cy.get('[data-testid="preview-course-btn"]').click();
    
    // 验证预览模态框
    cy.get('[data-testid="preview-modal"]').should('be.visible');
    cy.get('[data-testid="preview-title"]').should('contain', '测试课程标题');
    cy.get('[data-testid="preview-description"]').should('contain', '这是一个测试课程描述');
    cy.get('[data-testid="preview-price"]').should('contain', '0.1 ETH');
  });

  it('应该能够使用 AI 扩写功能', () => {
    // 填写课程内容
    cy.get('[data-testid="course-content-input"]').type('Web3 开发基础');
    
    // 点击 AI 扩写按钮
    cy.get('[data-testid="ai-expand-btn"]').click();
    
    // 验证扩写状态
    cy.get('[data-testid="ai-expanding"]').should('be.visible');
    
    // 等待扩写完成
    cy.get('[data-testid="ai-expanded-content"]', { timeout: 10000 }).should('be.visible');
  });

  it('应该能够创建课程', () => {
    // 填写课程信息
    cy.get('[data-testid="course-title-input"]').type('测试课程标题');
    cy.get('[data-testid="course-description-input"]').type('这是一个测试课程描述');
    cy.get('[data-testid="course-content-input"]').type('# 测试课程\n\n这是课程内容...');
    cy.get('[data-testid="course-price-input"]').type('0.1');
    cy.get('[data-testid="course-cover-input"]').type('https://via.placeholder.com/300x200');
    
    // 点击创建课程按钮
    cy.get('[data-testid="create-course-btn"]').click();
    
    // 验证 API 调用
    cy.wait('@createCourse');
    
    // 验证成功提示
    cy.get('[data-testid="success-toast"]').should('be.visible');
    cy.get('[data-testid="success-toast"]').should('contain', '课程创建成功');
  });

  it('应该验证必填字段', () => {
    // 不填写任何信息，直接点击创建
    cy.get('[data-testid="create-course-btn"]').click();
    
    // 验证错误提示
    cy.get('[data-testid="error-toast"]').should('be.visible');
    cy.get('[data-testid="error-toast"]').should('contain', '请填写所有必填字段');
  });

  it('应该验证价格格式', () => {
    // 填写无效价格
    cy.get('[data-testid="course-price-input"]').type('invalid-price');
    cy.get('[data-testid="create-course-btn"]').click();
    
    // 验证错误提示
    cy.get('[data-testid="error-toast"]').should('be.visible');
    cy.get('[data-testid="error-toast"]').should('contain', '请输入有效的价格');
  });

  it('应该能够取消创建', () => {
    // 填写一些信息
    cy.get('[data-testid="course-title-input"]').type('测试课程标题');
    
    // 点击取消按钮
    cy.get('[data-testid="cancel-course-btn"]').click();
    
    // 验证返回上一页
    cy.url().should('not.include', '/create-course');
  });
});

// 钱包连接端到端测试
describe('钱包连接测试', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('应该能够连接 MetaMask 钱包', () => {
    // 模拟 MetaMask 钱包
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().resolves(['0x1234567890123456789012345678901234567890']),
        on: cy.stub(),
        removeListener: cy.stub(),
      };
    });

    // 点击连接钱包按钮
    cy.get('[data-testid="connect-wallet-btn"]').click();

    // 验证钱包连接成功
    cy.get('[data-testid="wallet-connected"]').should('be.visible');
    cy.get('[data-testid="wallet-address"]').should('contain', '0x1234...7890');
    cy.get('[data-testid="wallet-balance"]').should('be.visible');
  });

  it('应该能够断开钱包连接', () => {
    // 先连接钱包
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().resolves(['0x1234567890123456789012345678901234567890']),
        on: cy.stub(),
        removeListener: cy.stub(),
      };
    });

    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.get('[data-testid="wallet-connected"]').should('be.visible');

    // 断开钱包连接
    cy.get('[data-testid="disconnect-wallet-btn"]').click();

    // 验证钱包已断开
    cy.get('[data-testid="connect-wallet-btn"]').should('be.visible');
    cy.get('[data-testid="wallet-connected"]').should('not.exist');
  });

  it('应该处理钱包连接失败', () => {
    // 模拟钱包连接失败
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().rejects(new Error('User rejected')),
        on: cy.stub(),
        removeListener: cy.stub(),
      };
    });

    // 点击连接钱包按钮
    cy.get('[data-testid="connect-wallet-btn"]').click();

    // 验证错误提示
    cy.get('[data-testid="error-toast"]').should('be.visible');
    cy.get('[data-testid="error-toast"]').should('contain', '钱包连接失败');
  });

  it('应该处理没有安装 MetaMask 的情况', () => {
    // 不设置 ethereum 对象
    cy.window().then((win) => {
      win.ethereum = undefined;
    });

    // 点击连接钱包按钮
    cy.get('[data-testid="connect-wallet-btn"]').click();

    // 验证错误提示
    cy.get('[data-testid="error-toast"]').should('be.visible');
    cy.get('[data-testid="error-toast"]').should('contain', '请安装 MetaMask');
  });

  it('应该能够切换网络', () => {
    // 连接钱包
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().resolves(['0x1234567890123456789012345678901234567890']),
        on: cy.stub(),
        removeListener: cy.stub(),
      };
    });

    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.get('[data-testid="wallet-connected"]').should('be.visible');

    // 点击网络切换按钮
    cy.get('[data-testid="network-switcher"]').click();

    // 验证网络选项
    cy.get('[data-testid="network-options"]').should('be.visible');
    cy.get('[data-testid="network-localhost"]').should('be.visible');
    cy.get('[data-testid="network-sepolia"]').should('be.visible');

    // 选择 Sepolia 网络
    cy.get('[data-testid="network-sepolia"]').click();

    // 验证网络切换成功
    cy.get('[data-testid="current-network"]').should('contain', 'Sepolia');
  });

  it('应该能够设置用户名', () => {
    // 连接钱包
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().resolves(['0x1234567890123456789012345678901234567890']),
        on: cy.stub(),
        removeListener: cy.stub(),
      };
    });

    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.get('[data-testid="wallet-connected"]').should('be.visible');

    // 点击设置用户名按钮
    cy.get('[data-testid="set-username-btn"]').click();

    // 输入用户名
    cy.get('[data-testid="username-input"]').type('测试用户');

    // 确认设置
    cy.get('[data-testid="confirm-username-btn"]').click();

    // 验证用户名设置成功
    cy.get('[data-testid="username-display"]').should('contain', '测试用户');
  });

  it('应该能够查看交易历史', () => {
    // 连接钱包
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().resolves(['0x1234567890123456789012345678901234567890']),
        on: cy.stub(),
        removeListener: cy.stub(),
      };
    });

    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.get('[data-testid="wallet-connected"]').should('be.visible');

    // 点击交易历史按钮
    cy.get('[data-testid="transaction-history-btn"]').click();

    // 验证交易历史页面
    cy.get('[data-testid="transaction-history"]').should('be.visible');
    cy.get('[data-testid="transaction-list"]').should('be.visible');
  });
});

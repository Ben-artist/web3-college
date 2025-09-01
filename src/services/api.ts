// API服务配置
export const API_CONFIG = {
  // Cloudflare Workers API
  WORKERS_API_BASE: 'https://web3-college-workers.2939117014tsk.workers.dev',
  
  // DeepSeek API
  DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
  DEEPSEEK_API_KEY: 'sk-d08d15ac6d0f4729929d63b063796d13',
  DEEPSEEK_MODEL: 'deepseek-chat',
  
  // Coze API - 用于生成封面图
  COZE_API_URL: 'https://api.coze.cn/v1/workflow/run',
  COZE_API_KEY: 'pat_IHrQddUnAAYHS423ng1jTHBfqEj2evEW6Y339Hp8ET3kG3PClblAN0Xv5cy4ple1',
  COZE_WORKFLOW_ID: '7469702089107767330',
  
  // TSKToken合约地址
  TSK_TOKEN_ADDRESS: '0x5F47394fb6C50B80EEa9a388142B5165B1431565',
  
  // CourseManager合约地址
  COURSE_MANAGER_ADDRESS: '0x175a7200e412D4D0041Ec4785207D28436720E19',
  
  // TokenExchange合约地址 - 已更新为最新部署地址
  TOKEN_EXCHANGE_ADDRESS: '0x9e78396494C8C57a66D462d487a4c49EA88aa82D'
} as const;

// Workers API 服务
export class WorkersAPIService {
  private static baseUrl = API_CONFIG.WORKERS_API_BASE;

  // 创建课程
  static async createCourse(
    address: string, 
    courseId: string, 
    content: string, 
    title: string, 
    cost: number,
    description?: string,
    cover?: string,
    txHash?: string
  ) {
    const response = await fetch(`${this.baseUrl}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        courseId,
        content,
        title,
        cost,
        description,
        cover,
        txHash
      })
    });
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    return await response.json();
  }

  // 获取用户课程
  static async getUserCourses(address: string) {
    const response = await fetch(`${this.baseUrl}/api/courses/${address}`);
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    return await response.json();
  }

  // 获取所有课程
  static async getAllCourses() {
    const response = await fetch(`${this.baseUrl}/api/courses`);
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    return await response.json();
  }

  // 记录购买
  static async recordPurchase(
    courseId: string, 
    creator: string, 
    buyer: string, 
    title: string, 
    cost: number,
    txHash?: string
  ) {
    const response = await fetch(`${this.baseUrl}/api/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
        creator,
        buyer,
        title,
        cost,
        txHash
      })
    });
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    return await response.json();
  }

  // 检查学生是否购买过特定课程
  static async checkStudentPurchase(courseId: string, studentAddress: string) {
    const response = await fetch(`${this.baseUrl}/api/purchases/check/${courseId}/${studentAddress}`);
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    return await response.json();
  }

  // 健康检查
  static async healthCheck() {
    const response = await fetch(`${this.baseUrl}/api/health`);
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    return await response.json();
  }
}

// DeepSeek API 服务
export class DeepSeekAPIService {
  private static apiUrl = API_CONFIG.DEEPSEEK_API_URL;
  private static apiKey = API_CONFIG.DEEPSEEK_API_KEY;
  private static model = API_CONFIG.DEEPSEEK_MODEL;

  // AI美化课程内容 - Stream模式
  static async beautifyCourseContentStream(
    content: string, 
    onChunk: (chunk: string) => void,
    onComplete: (fullContent: string) => void,
    onError: (error: Error) => void
  ) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: `请将以下课程内容美化为更加生动、有趣、易懂的版本。要求：
1. 保持原意的同时，使用更加生动形象的语言
2. 添加适当的比喻和例子
3. 使用更加吸引人的表达方式
4. 让内容更加通俗易懂
5. 保持专业性的同时增加趣味性

课程内容：
${content}`
            }
          ],
          max_tokens: 1500,
          temperature: 0.8,
          stream: true // 启用流式响应
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API调用失败: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                onComplete(fullContent);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  const contentChunk = parsed.choices[0].delta.content;
                  fullContent += contentChunk;
                  onChunk(contentChunk);
                }
              } catch (e) {
                // 忽略解析错误，继续处理下一行
                console.warn('解析流数据失败:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Stream API调用失败:', error);
      onError(error instanceof Error ? error : new Error('未知错误'));
    }
  }

  // AI美化课程标题 - Stream模式
  static async beautifyCourseTitleStream(
    title: string,
    onChunk: (chunk: string) => void,
    onComplete: (fullTitle: string) => void,
    onError: (error: Error) => void
  ) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: `请将以下课程标题美化为更加吸引人、有创意的版本。要求：
1. 保持原意的同时，使用更加吸引人的词汇
2. 可以添加适当的修饰词或比喻
3. 让标题更加有冲击力和记忆点
4. 长度控制在15个字以内
5. 避免过于夸张，保持专业性

课程标题：
${title}`
            }
          ],
          max_tokens: 500,
          temperature: 0.9,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API调用失败: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullTitle = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                onComplete(fullTitle);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  const titleChunk = parsed.choices[0].delta.content;
                  fullTitle += titleChunk;
                  onChunk(titleChunk);
                }
              } catch (e) {
                console.warn('解析流数据失败:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Stream API调用失败:', error);
      onError(error instanceof Error ? error : new Error('未知错误'));
    }
  }

  // 保留原有的非流式方法作为备用
  // AI美化课程内容
  static async beautifyCourseContent(content: string) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: `请将以下课程内容美化为更加生动、有趣、易懂的版本。要求：
1. 保持原意的同时，使用更加生动形象的语言
2. 添加适当的比喻和例子
3. 使用更加吸引人的表达方式
4. 让内容更加通俗易懂
5. 保持专业性的同时增加趣味性

课程内容：
${content}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // AI美化课程标题
  static async beautifyCourseTitle(title: string) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: `请将以下课程标题美化为更加吸引人、有创意的版本。要求：
1. 保持原意的同时，使用更加吸引人的词汇
2. 可以添加适当的修饰词或比喻
3. 让标题更加有冲击力和记忆点
4. 长度控制在15个字以内
5. 避免过于夸张，保持专业性

课程标题：
${title}`
          }
        ],
        max_tokens: 500,
        temperature: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // AI美化课程内容和标题（组合美化）
  static async beautifyCourse(title: string, content: string) {
    try {
      // 并行调用两个API
      const [beautifiedTitle, beautifiedContent] = await Promise.all([
        this.beautifyCourseTitle(title),
        this.beautifyCourseContent(content)
      ]);

      return {
        title: beautifiedTitle,
        content: beautifiedContent
      };
    } catch (error) {
      console.error('AI美化失败:', error);
      throw error;
    }
  }

  // 自定义AI美化（支持自定义提示词）
  static async customBeautify(content: string, prompt: string) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n${content}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Coze API 服务 - 用于生成封面图
export class CozeAPIService {
  private static apiUrl = API_CONFIG.COZE_API_URL;
  private static apiKey = API_CONFIG.COZE_API_KEY;

  // 根据课程信息生成封面图
  static async generateCoverImage(title: string, description?: string, _content?: string) {
    try {
      // 精简提示词，让图片更容易生成
      let prompt = `课程封面：${title}`;
      
      if (description) {
        prompt += `，${description}`;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          workflow_id: API_CONFIG.COZE_WORKFLOW_ID,
          parameters: {
            input: prompt
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Coze API调用失败: ${response.status}`);
      }

      const data = await response.json();
      
      // 根据Coze API的实际返回格式处理结果
      // 从data字段中解析output URL
      if (data.data) {
        try {
          const dataContent = JSON.parse(data.data);
          if (dataContent.output) {
            return dataContent.output;
          }
        } catch (parseError) {
          console.warn('解析data字段失败:', parseError);
        }
      }
      
      // 备用方案：直接查找output字段
      if (data.output) {
        return data.output;
      }
      
      // 如果都没有找到，抛出错误
      throw new Error('API返回的数据中没有找到图片URL');
    } catch (error) {
      console.error('生成封面图失败:', error);
      throw error;
    }
  }

  // 根据课程类型生成特定风格的封面图
  static async generateTypedCoverImage(
    title: string, 
    courseType: 'technology' | 'business' | 'art' | 'science' | 'language' | 'other',
    description?: string
  ) {
    // 详细的类型风格描述
    const typePrompts = {
      technology: {
        style: '现代科技风格',
        colors: '蓝色、绿色、银色等科技感色彩',
        elements: '代码、电路、数据流、科技图标、现代界面元素',
        mood: '专业、创新、未来感'
      },
      business: {
        style: '商务专业风格',
        colors: '深蓝、灰色、金色等商务色彩',
        elements: '图表、商务人士、办公环境、成功元素',
        mood: '专业、可信、成功'
      },
      art: {
        style: '创意艺术风格',
        colors: '丰富的色彩搭配，艺术感强',
        elements: '画笔、调色板、艺术作品、创意元素',
        mood: '创意、灵感、美感'
      },
      science: {
        style: '科学教育风格',
        colors: '白色、蓝色、绿色等清新色彩',
        elements: '实验器材、分子结构、科学符号、教育元素',
        mood: '严谨、探索、学习'
      },
      language: {
        style: '语言学习风格',
        colors: '温暖的颜色，如橙色、黄色、红色',
        elements: '文字、书籍、对话气泡、语言符号',
        mood: '友好、交流、学习'
      },
      other: {
        style: '通用教育风格',
        colors: '温和的色彩搭配',
        elements: '书籍、学习图标、教育元素',
        mood: '专业、友好、学习'
      }
    };

    const typeInfo = typePrompts[courseType];
    
    // 构建详细的提示词
    let prompt = `为在线教育课程"${title}"设计${typeInfo.style}封面图，要求：
1. 风格：${typeInfo.style}，体现${typeInfo.mood}的氛围
2. 色彩：使用${typeInfo.colors}
3. 元素：包含${typeInfo.elements}
4. 整体：专业、吸引人、适合在线教育
5. 质量：高清、适合作为课程封面`;
    
    if (description) {
      prompt += `\n课程描述：${description}`;
    }

    // 直接调用API，使用构建好的提示词
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        workflow_id: API_CONFIG.COZE_WORKFLOW_ID,
        parameters: {
          input: prompt
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Coze API调用失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 根据Coze API的实际返回格式处理结果
    if (data.data) {
      try {
        const dataContent = JSON.parse(data.data);
        if (dataContent.output) {
          return dataContent.output;
        }
      } catch (parseError) {
        console.warn('解析data字段失败:', parseError);
      }
    }
    
    // 备用方案：直接查找output字段
    if (data.output) {
      return data.output;
    }
    
    // 如果都没有找到，抛出错误
    throw new Error('API返回的数据中没有找到图片URL');
  }

  // 批量生成多个封面图选项
  static async generateMultipleCoverOptions(title: string, description?: string, count: number = 3) {
    try {
      const promises = [];
      for (let i = 0; i < count; i++) {
        // 为每个选项添加不同的风格要求
        const styleVariations = [
          '现代简约风格',
          '传统经典风格', 
          '创意艺术风格'
        ];
        
        const stylePrompt = `${styleVariations[i % styleVariations.length]}，`;
        
        let prompt = `请为以下课程生成一个${stylePrompt}吸引人的封面图描述，要求：
1. 封面图应该体现课程的主题和内容
2. 风格要现代、专业、有教育感
3. 色彩搭配要和谐，适合作为课程封面
4. 描述要具体，包含视觉元素、色彩、构图等
5. 长度控制在100字以内

课程标题：${title}`;

        if (description) {
          prompt += `\n课程描述：${description}`;
        }

        promises.push(this.generateCoverImage(title, description));
      }

      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('批量生成封面图失败:', error);
      throw error;
    }
  }
}

// CourseManager合约服务
export class CourseManagerService {
  private static contractAddress = API_CONFIG.COURSE_MANAGER_ADDRESS;
  
  // 获取合约地址
  static getContractAddress() {
    return this.contractAddress;
  }
  
  // 添加购买者到课程
  static async addBuyerToCourse(courseId: number, buyerAddress: string) {
    return {
      address: this.contractAddress as `0x${string}`,
      functionName: 'addBuyerToCourse',
      args: [courseId, buyerAddress as `0x${string}`]
    };
  }
  
  // 检查用户是否已购买课程
  static async isBuyerInCourse(courseId: number, buyerAddress: string) {
    console.log('isBuyerInCourse', courseId, buyerAddress)
    return {
      address: this.contractAddress as `0x${string}`,
      functionName: 'isBuyerInCourse',
      args: [courseId, buyerAddress as `0x${string}`]
    };
  }
  
  // 获取课程购买者列表
  static async getCourseBuyers(courseId: number) {
    return {
      address: this.contractAddress as `0x${string}`,
      functionName: 'getCourseBuyers',
      args: [courseId]
    };
  }

  // 🆕 购买课程 - 完整的购买流程
  static async purchaseCourse(
    courseId: string,
    buyerAddress: string,
    authorAddress: string,
    courseTitle: string,
    courseCost: number
  ) {
    try {
      // 1. 首先调用TSKToken合约的transfer函数，向作者转账
      const tskTransferParams = {
        address: API_CONFIG.TSK_TOKEN_ADDRESS as `0x${string}`,
        abi: [], // 这里需要传入TSKToken的ABI
        functionName: 'transfer',
        args: [authorAddress as `0x${string}`, courseCost]
      };

      // 2. 调用CourseManager合约的addBuyerToCourse函数
      const courseIdNumber = parseInt(courseId.replace('course-', '').split('-')[0]);
      const addBuyerParams = await this.addBuyerToCourse(courseIdNumber, buyerAddress);

      // 3. 记录购买到Workers API
      const purchaseRecord = await WorkersAPIService.recordPurchase(
        courseId,
        authorAddress,
        buyerAddress,
        courseTitle,
        courseCost
      );

      return {
        success: true,
        tskTransferParams,
        addBuyerParams,
        purchaseRecord,
        message: '购买流程准备完成，请确认交易'
      };
    } catch (error) {
      console.error('准备购买流程失败:', error);
      throw new Error(`准备购买流程失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 🆕 检查用户TSK余额是否足够
  static async checkTSKBalance(buyerAddress: string, _requiredAmount: number) {
    return {
      address: API_CONFIG.TSK_TOKEN_ADDRESS as `0x${string}`,
      functionName: 'balanceOf',
      args: [buyerAddress as `0x${string}`]
    };
  }
}

// 合约API服务
export class ContractAPIService {
  // 这里可以添加与智能合约交互的API方法
  // 比如调用TSKToken的mint、approve等方法
  
  static getTSKTokenAddress() {
    return API_CONFIG.TSK_TOKEN_ADDRESS;
  }
}

// 导出默认配置
export default {
  WorkersAPIService,
  DeepSeekAPIService,
  CozeAPIService,
  CourseManagerService,
  ContractAPIService,
  API_CONFIG
};
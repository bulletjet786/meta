import { describe, it, expect } from 'vitest';
import { createConnectClient } from './supabase'; // 导入工厂函数
import { TranslateRequest, TranslateResponse } from '../gen/library/v1/library_pb';

// 创建一个专门用于测试的客户端实例，它不依赖本地认证服务
const testClient = createConnectClient({ useAuthService: false });

describe('LibraryService.Translate Integration Test', () => {

  // 延长超时时间以适应网络延迟
  it('should successfully call the Translate method using an anon key', async () => {
    const request: TranslateRequest = {
      libraries: [
        // @ts-ignore - We know the runtime handles this correctly without the $typeName property.
        { appId: 1289310, name: "HellTaker" }
      ],
      targetLanguage: "zh_CN"
    };

    try {
      // 使用测试专用的客户端实例
      const response = await testClient.translate(request);

      console.log('Translate API Response:', response);

      expect(response).toBeDefined();
      // 断言 2: 验证响应对象的类型名称，这是更可靠的检查方式
      expect(response.$typeName).toBe('library.v1.TranslateResponse');

    } catch (error) {
      console.error("Translate RPC call failed:", error);
      throw error;
    }
  }, 20000); // 20秒超时应该足够了
});

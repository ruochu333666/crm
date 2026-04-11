import { Alert, Button, Card, Form, InputNumber, Space, Switch, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { MainLayout } from "../../components/MainLayout";
import { aiApi, type AIStatus } from "../../api/ai";
import { poolApi } from "../../api/pool";
import type { PoolRule } from "../../api/types";
import styles from "./index.module.less";

const { Title, Paragraph } = Typography;

function SettingsPage() {
  const [form] = Form.useForm<PoolRule>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningRecycle, setRunningRecycle] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [aiStatusLoading, setAiStatusLoading] = useState(false);

  const loadRules = async () => {
    try {
      setLoading(true);
      const res = await poolApi.getRules();
      form.setFieldsValue(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载规则失败";
      console.error("[SettingsPage] 加载公海规则失败:", error);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadAiStatus = async () => {
    try {
      setAiStatusLoading(true);
      const res = await aiApi.getStatus();
      setAiStatus(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载 AI 状态失败";
      console.error("[SettingsPage] 加载 AI 状态失败:", error);
      message.error(errMsg);
    } finally {
      setAiStatusLoading(false);
    }
  };

  useEffect(() => {
    void loadRules();
    void loadAiStatus();
  }, []);

  const handleSave = async (values: PoolRule) => {
    try {
      setSaving(true);
      await poolApi.updateRules(values);
      message.success("公海规则已保存");
      await loadRules();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "保存规则失败";
      console.error("[SettingsPage] 保存公海规则失败:", error);
      message.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleRunRecycle = async () => {
    try {
      setRunningRecycle(true);
      const res = await poolApi.runRecycle();
      message.success(
        `${res.message}：总回收 ${res.data.recycledCount} 条（超期未跟进 ${res.data.byInactiveDays}，超时未首跟进 ${res.data.byTimeoutNoFollowup}）`
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "执行回收任务失败";
      console.error("[SettingsPage] 执行回收任务失败:", error);
      message.error(errMsg);
    } finally {
      setRunningRecycle(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.wrap}>
        <Title level={3} className={styles.pageTitle}>
          设置
        </Title>

        <Card className={styles.card}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div className={styles.cardHeader}>
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  AI 销售助手状态
                </Title>
                <Paragraph style={{ marginBottom: 0 }}>
                  如果这里显示缺项，AI 销售助手就无法正常调用大模型。
                </Paragraph>
              </div>
              {aiStatus ? (
                <Tag color={aiStatus.ready ? "green" : "red"}>
                  {aiStatus.ready ? "可用" : "不可用"}
                </Tag>
              ) : null}
            </div>

            {aiStatus ? (
              <Alert
                type={aiStatus.ready ? "success" : "warning"}
                showIcon
                message={
                  aiStatus.ready
                    ? "AI 销售助手配置完整，可以正常使用。"
                    : "AI 销售助手当前不可用，请检查 backend/.env。"
                }
                description={
                  <Space size={[8, 8]} wrap>
                    <Tag color={aiStatus.enabled ? "green" : "default"}>
                      AI_ENABLED: {aiStatus.enabled ? "true" : "false"}
                    </Tag>
                    <Tag color={aiStatus.hasBaseUrl ? "green" : "default"}>
                      AI_BASE_URL: {aiStatus.hasBaseUrl ? "已配置" : "缺失"}
                    </Tag>
                    <Tag color={aiStatus.hasApiKey ? "green" : "default"}>
                      AI_API_KEY: {aiStatus.hasApiKey ? "已配置" : "缺失"}
                    </Tag>
                    <Tag color={aiStatus.hasModel ? "green" : "default"}>
                      AI_MODEL: {aiStatus.hasModel ? "已配置" : "缺失"}
                    </Tag>
                    <Tag>AI_PROTOCOL: {aiStatus.protocol}</Tag>
                  </Space>
                }
              />
            ) : null}

            <Space>
              <Button onClick={() => void loadAiStatus()} loading={aiStatusLoading}>
                刷新 AI 状态
              </Button>
            </Space>
          </Space>
        </Card>

        <Card className={styles.card}>
          <Paragraph>公海管理规则，建议由管理员或销售经理维护。</Paragraph>
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => void handleSave(values)}
            disabled={loading}
          >
            <Form.Item
              label="自动回收天数（私海客户未跟进）"
              name="recycleDays"
              rules={[{ required: true, message: "请输入回收天数" }]}
            >
              <InputNumber min={1} max={365} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="每日捞取上限（每人）"
              name="dailyTakeLimit"
              rules={[{ required: true, message: "请输入每日捞取上限" }]}
            >
              <InputNumber min={1} max={999} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="捞取后首跟进时限（小时）"
              name="followupRequiredHours"
              rules={[{ required: true, message: "请输入首跟进时限" }]}
            >
              <InputNumber min={1} max={168} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="捞取保护期（分钟）"
              name="grabProtectMinutes"
              rules={[{ required: true, message: "请输入保护期" }]}
            >
              <InputNumber min={0} max={1440} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="是否开启捞取审批" name="needApproval" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存规则
              </Button>
              <Button onClick={() => void loadRules()} loading={loading}>
                重新加载
              </Button>
              <Button onClick={() => void handleRunRecycle()} loading={runningRecycle}>
                立即执行回收任务
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}

export default SettingsPage;

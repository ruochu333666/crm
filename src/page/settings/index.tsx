import { Button, Card, Form, InputNumber, Space, Switch, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { MainLayout } from "../../components/MainLayout";
import { poolApi } from "../../api/pool";
import type { PoolRule } from "../../api/types";
import styles from "./index.module.less";

const { Title, Paragraph } = Typography;

function SettingsPage() {
  const [form] = Form.useForm<PoolRule>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningRecycle, setRunningRecycle] = useState(false);

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

  useEffect(() => {
    void loadRules();
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
          <Paragraph>公海管理规则（建议由管理员/销售经理维护）</Paragraph>
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

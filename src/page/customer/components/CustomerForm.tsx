import { Form, Input, Select, Button, Space, message } from "antd";
import { useState, useEffect } from "react";
import styles from "./CustomerForm.module.less";

const { Option } = Select;

interface CustomerFormProps {
  customer?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomerForm({
  customer,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      form.setFieldsValue(customer);
    }
  }, [customer, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("客户数据:", values);
      message.success(customer ? "编辑成功" : "新增成功");
      onSuccess();
    } catch (error) {
      message.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
      >
        <div className={styles.formRow}>
          <Form.Item
            name="name"
            label="客户名称"
            rules={[{ required: true, message: "请输入客户名称" }]}
            className={styles.formItem}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>

          <Form.Item
            name="company"
            label="公司名称"
            rules={[{ required: true, message: "请输入公司名称" }]}
            className={styles.formItem}
          >
            <Input placeholder="请输入公司名称" />
          </Form.Item>
        </div>

        <div className={styles.formRow}>
          <Form.Item
            name="contact"
            label="联系人"
            rules={[{ required: true, message: "请输入联系人" }]}
            className={styles.formItem}
          >
            <Input placeholder="请输入联系人姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: "请输入联系电话" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码" },
            ]}
            className={styles.formItem}
          >
            <Input placeholder="请输入手机号码" />
          </Form.Item>
        </div>

        <div className={styles.formRow}>
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: "请输入邮箱地址" },
              { type: "email", message: "请输入正确的邮箱格式" },
            ]}
            className={styles.formItem}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item
            name="region"
            label="所属地区"
            rules={[{ required: true, message: "请选择所属地区" }]}
            className={styles.formItem}
          >
            <Select placeholder="请选择地区">
              <Option value="华东">华东</Option>
              <Option value="华南">华南</Option>
              <Option value="华北">华北</Option>
              <Option value="西南">西南</Option>
              <Option value="西北">西北</Option>
              <Option value="东北">东北</Option>
            </Select>
          </Form.Item>
        </div>

        <div className={styles.formRow}>
          <Form.Item
            name="status"
            label="客户状态"
            rules={[{ required: true, message: "请选择客户状态" }]}
            className={styles.formItem}
          >
            <Select placeholder="请选择状态">
              <Option value="active">活跃</Option>
              <Option value="potential">潜在</Option>
              <Option value="inactive">非活跃</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="industry"
            label="所属行业"
            className={styles.formItem}
          >
            <Select placeholder="请选择行业" allowClear>
              <Option value="互联网">互联网</Option>
              <Option value="金融">金融</Option>
              <Option value="制造业">制造业</Option>
              <Option value="教育">教育</Option>
              <Option value="医疗">医疗</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="address" label="详细地址" className={styles.formItem}>
          <Input.TextArea placeholder="请输入详细地址" rows={3} />
        </Form.Item>

        <Form.Item name="remark" label="备注信息" className={styles.formItem}>
          <Input.TextArea placeholder="请输入备注信息" rows={3} />
        </Form.Item>

        <div className={styles.formActions}>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {customer ? "保存修改" : "新增客户"}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}

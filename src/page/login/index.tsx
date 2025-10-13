import { Button, Checkbox, Form, Input } from "antd";
import type { FormProps } from "react-router-dom";
import styles from "./index.module.less";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};
function LoginPage() {
  const login = () => {};

  const onFinish = (values: any) => {
    console.log("Success:", values);
  };
  return (
    <div className={styles.loginContainer}>
      <div className={styles.title}>贸易管理系统</div>
      <div className={styles.text}>客户关系管理平台</div>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<FieldType>
          name="remember"
          valuePropName="checked"
          label={null}
        >
          <Checkbox>记住我</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default LoginPage;

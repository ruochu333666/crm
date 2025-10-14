import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { authApi } from "../../api/auth";
import styles from "./index.module.less";

type FieldType = {
  username?: string;
  password?: string;
  confirmPassword?: string;
};

function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // 验证密码确认
      if (values.password !== values.confirmPassword) {
        message.error("两次输入的密码不一致");
        return;
      }

      await authApi.register({
        username: values.username,
        password: values.password,
      });

      message.success("注册成功！请登录");
      console.log("注册成功");

      // TODO: 跳转到登录页
      // navigate('/login');
    } catch (error: any) {
      message.error(error.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.title}>用户注册</div>
        <div className={styles.subtitle}>创建新账户</div>

        <div className={styles.formContainer}>
          <Form
            name="register"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="用户名"
              name="username"
              className={styles.formItem}
              rules={[
                { required: true, message: "请输入用户名!" },
                { min: 3, message: "用户名至少3个字符" },
              ]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item<FieldType>
              label="密码"
              name="password"
              className={styles.formItem}
              rules={[
                { required: true, message: "请输入密码!" },
                { min: 6, message: "密码至少6个字符" },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>

            <Form.Item<FieldType>
              label="确认密码"
              name="confirmPassword"
              className={styles.formItem}
              rules={[{ required: true, message: "请确认密码!" }]}
            >
              <Input.Password placeholder="请再次输入密码" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.submitButton}
                loading={loading}
                block
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

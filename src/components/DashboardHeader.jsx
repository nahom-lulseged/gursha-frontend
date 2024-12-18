import { Layout, Typography, Avatar, Badge } from 'antd';
import { UserOutlined, LogoutOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

function DashboardHeader({ user, cartCount, onShowCart, onLogout }) {
  return (
    <Header className="flex justify-between items-center bg-orange-500 px-6 shadow-md">
      <Title level={4} className="text-white m-0 ml-10 ">Dashboard</Title>
      <div className="flex items-center gap-4">
        <Badge count={cartCount} showZero>
          <ShoppingCartOutlined 
            className="text-xl cursor-pointer text-white hover:text-blue-600"
            onClick={onShowCart}
          />
        </Badge>
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} className="mr-2" />
          <span className="text-white">{user?.username}</span>
        </div>
        <LogoutOutlined
          onClick={onLogout}
          className="text-xl cursor-pointer text-white hover:text-blue-600"
        />
      </div>
    </Header>
  );
}

export default DashboardHeader; 
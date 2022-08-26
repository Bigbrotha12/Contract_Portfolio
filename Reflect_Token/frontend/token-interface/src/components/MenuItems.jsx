import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

function MenuItems() {
  const { pathname } = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      style={{
        display: "flex",
        fontSize: "17px",
        fontWeight: "500",
        width: "100%",
        justifyContent: "center",
      }}
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item key="/transfer">
        <NavLink to="/transfer">Token Transfer</NavLink>
      </Menu.Item>
      <Menu.Item key="/deploy">
        <NavLink to="/deploy">ERC20 Deploy</NavLink>
      </Menu.Item>
      <Menu.Item key="/abi">
        <NavLink to="/abi">ERC20 Contract</NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default MenuItems;

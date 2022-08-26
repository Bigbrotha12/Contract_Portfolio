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

      <Menu.Item key="/main">
        <NavLink to="/main">Main</NavLink>
      </Menu.Item>
      <Menu.Item key="/deployer">
        <NavLink to="/deployer">Deployer</NavLink>
      </Menu.Item>
      <Menu.Item key="/contract">
        <NavLink to="/contract">Contract</NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default MenuItems;

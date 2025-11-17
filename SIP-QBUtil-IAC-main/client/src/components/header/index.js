import React from "react";

import logo from "../../asset/logo.png";

const Header = () => {
  return (
    <div className="text-center pt-3 pb-3 px-4 border-bottom">
      <img src={logo} alt="logo" />
    </div>
  );
};

export default Header;

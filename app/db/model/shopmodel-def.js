const Sequelize = require('sequelize

/*
const ShopUserTypeDef = {
  UserType_Name :  {
    type: Sequelize.STRING(40),
    allowNull: false
  },
  UserType_DESC :  {
    type: Sequelize.STRING,
  }
};
const ShopUserDef = {
  username  :  {
    type: Sequelize.STRING(80),
    unique: true,
    allowNull: false
  },
  password  :  {
    type: Sequelize.STRING,
    get() {
      return () => this.getDataValue('password')
    }
  },
  salt: {
    type: Sequelize.STRING,
    get() {
      return() => this.getDataValue('salt')
    }
  }
};
const ShopUserInfoDef = {
	User_NameEN :  {
		type: Sequelize.STRING(80),
		allowNull: false
	},
	User_LastNameEN :  {
		type: Sequelize.STRING(80),
		allowNull: false
	},
	User_NameTH :  {
		type: Sequelize.STRING(80)
	},
	User_LastNameTH :  {
		type: Sequelize.STRING(80)
	},
	User_Email :  {
		type: Sequelize.STRING(60)
	},
	User_Phone :  {
		type: Sequelize.STRING(40),
		allowNull: false
	},
	User_LineID :  {
		type: Sequelize.STRING(80)
	}
};
*/
const ShopShopDef = {
  Shop_Name : {
    type: Sequelize.STRING(150),
    allowNull: false
  },
  Shop_Address : {
    type: Sequelize.STRING,
    allowNull: false
  },
  Shop_Tel : {
    type: Sequelize.STRING(80)
  },
  Shop_WebUrl : {
    type: Sequelize.STRING(80)
  },
  Shop_VatNo : {
    type: Sequelize.STRING
  },
};
const ShopMenuGroupDef = {

};
const ShopMenuItemDef = {

};
const ShopCustomerDef = {

};
const ShopOrderDef = {

};
const ShopBillDef = {

};
const ShopInvoiceDef = {

};
const ShopTemplateDef = {

};

module.exports = {
  /*
  ShopUserTypeDef
  ShopUserDef
  ShopUserInfoDef
  */
  ShopShopDef
}

const Sequelize = require('sequelize');

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
		type: Sequelize.STRING(80)
	},
	User_LastNameEN :  {
		type: Sequelize.STRING(80)
	},
	User_NameTH :  {
		type: Sequelize.STRING(80),
		allowNull: false
	},
	User_LastNameTH :  {
		type: Sequelize.STRING(80),
		allowNull: false
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
  /*
  User_LineUserId
  User_LineDisplayName

  */
};

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
    type: Sequelize.STRING(30)
  },
  Shop_Mail : {
    type: Sequelize.STRING(80)
  },
  Shop_LogoFilename : {
    type: Sequelize.STRING(80)
  },
  Shop_VatNo : {
    type: Sequelize.STRING(20)
  },
  Shop_BillQuota : {
    type: Sequelize.STRING(10)
  },
  Shop_PromptPayNo : {
    type: Sequelize.STRING(30)
  },
  Shop_PromptPayName : {
    type: Sequelize.STRING(30)
  },
  Shop_StockingOption : {
    type: Sequelize.STRING(1), // <- 0=Not Open Stocking Option, 1=Open Stocking Option
    defaultValue: '0'
  },
  Shop_CookingOption : {
    type: Sequelize.STRING(1), // <- 0=Not Open Cooking Option, 1=Open Cooking Option
    defaultValue: '0'
  }
};

const ShopMenuGroupDef = {
  GroupName : {
    type: Sequelize.STRING(80)
  },
  GroupPicture : {
    type: Sequelize.STRING(80)
  },
  GroupDesc : {
    type: Sequelize.STRING
  }
};
const ShopMenuItemDef = {
  MenuName : {
    type: Sequelize.STRING(80)
  },
  MenuPicture : {
    type: Sequelize.STRING(80)
  },
  Price : {
    type: Sequelize.STRING(10)
  },
  Unit : {
    type: Sequelize.STRING(30)
  },
  QRCodePicture : {
    type: Sequelize.STRING(30)
  },
  Desc : {
    type: Sequelize.STRING
  },
  StockingOption : {
    type: Sequelize.STRING(1), // <- 0=Not Run Stocking Option, 1=Run Stocking Option
    defaultValue: '0'
  }
};
const ShopCustomerDef = {
  Name : {
    type: Sequelize.STRING(150),
    allowNull: false
  },
  Address : {
    type: Sequelize.STRING,
  },
  Tel : {
    type: Sequelize.STRING(30)
  },
  Mail : {
    type: Sequelize.STRING(80)
  }
};
const ShopOrderDef = {
  Items : {
    type: Sequelize.JSONB,
    allowNull: false,
    defaultValue: []
  },
  Status : {
    type: Sequelize.INTEGER, // <- 0=cancel, 1=active, 2=onInvoice, 3=onBill, 4=Acrchive
    defaultValue: 1
  },
  BeforeItems : {
    type: Sequelize.JSONB
  }
};
const ShopInvoiceDef = {
  No : {
    type: Sequelize.STRING(80),
    allowNull: false
  },
  Discount : {
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  Vat : {
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  Filename : {
    type: Sequelize.STRING(80)
  }
};
const ShopBillDef = {
  No : {
    type: Sequelize.STRING(80),
    allowNull: false
  },
  Discount : {
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  Vat : {
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  Filename : {
    type: Sequelize.STRING(80)
  },
  Remark : {
  	type: Sequelize.TEXT,
  },
  Report : {
    type: Sequelize.JSONB,
  }
};
const ShopTaxInvoiceDef = {
  No : {
    type: Sequelize.STRING(80),
    allowNull: false
  },
  Discount : {
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  Vat : {
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  Filename : {
    type: Sequelize.STRING(80)
  },
  Remark : {
  	type: Sequelize.TEXT,
  },
  Report : {
    type: Sequelize.JSONB,
  }
};
const ShopPaytypeDef = {
  NameTH : {
    type: Sequelize.STRING(80)
  },
  NameEN : {
    type: Sequelize.STRING(80)
  }
};
const ShopPaymentDef = {
  Amount : {
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  PayType : {
    type: Sequelize.INTEGER,
    defaultValue: 1
  }
};
const ShopTemplateDef = {
  Name : {
    type: Sequelize.STRING(80)
  },
  TypeId : {
    type: Sequelize.INTEGER, // <- 1=Invoice, 2=Bill, 3=TaxInvoice
  },
  Content : {
    type: Sequelize.JSON,
    allowNull: false
  },
  PaperSize : {
    type: Sequelize.INTEGER, // <- 1=A4, 2=Slip
    defaultValue: 1
  },
  Options : {
    type: Sequelize.JSONB,
    defaultValue: {"ppqr": {"invoice": 1, "bill": 1, "taxinvoice": 1}}
  }
};

const ShopStockingDef = {
  Direction : {
    type: Sequelize.STRING(1) // <- + = Stocking in direction,  - = Stocking out direction
  },
  Qty : {
    type: Sequelize.FLOAT
  },
  Price : {
    type: Sequelize.FLOAT
  },
  StockedAt : {
    type: Sequelize.DATE
  }
};

const ShopMessageDef = {
  Message : {
    type: Sequelize.TEXT,
  },
  ToUserId : {
    type: Sequelize.INTEGER
  },
  ToShopId : {
    type: Sequelize.INTEGER
  },
  Status : {
    type: Sequelize.INTEGER // 1-new, 2-open, 3-close
  }
};

const ShopPayServiceDef = {
  BillUrl : {
    type: Sequelize.STRING(190),
  },
  BillAmount : {
    type: Sequelize.FLOAT
  }
};

module.exports = {
  ShopUserTypeDef,
  ShopUserDef,
  ShopUserInfoDef,
  ShopShopDef,
  ShopMenuGroupDef,
  ShopMenuItemDef,
  ShopCustomerDef,
  ShopOrderDef,
  ShopInvoiceDef,
  ShopBillDef,
  ShopTaxInvoiceDef,
  ShopPaytypeDef,
  ShopPaymentDef,
  ShopTemplateDef,
  ShopStockingDef,
  ShopMessageDef,
  ShopPayServiceDef
}

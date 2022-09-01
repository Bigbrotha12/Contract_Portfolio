const FamiliarAdmin = artifacts.require("FamiliarAdmin");
const FamiliarIMX = artifacts.require("FamiliarIMX");
const FamiliarLogic = artifacts.require("FamiliarLogic");
const FamiliarProxy = artifacts.require("FamiliarProxy");
const truffleAssert = require('truffle-assertions');

contract("Proxy", (accounts) => {
  let famAdmin, famIMX, famLogic, famProxy;
  before( async () => {
    famAdmin = await FamiliarAdmin.deployed(); 
    famIMX = await FamiliarIMX.deployed();
    famLogic = await FamiliarLogic.deployed();
    famProxy = await FamiliarProxy.deployed();
  });

  it("initializes to correct routing configuration", async () => {

  });

  it("is a transparent proxy", async () => {

  });

  it("changes admin and routing successfully", async () => {

  });

  it("checks for valid upgrade target and initializes", async () => {

  });
  
});

contract("FamiliarAdmin", (accounts) => {
  let famAdmin, famIMX, famLogic, famProxy;
  before( async () => {
    famAdmin = await FamiliarAdmin.deployed(); 
    famIMX = await FamiliarIMX.deployed();
    famLogic = await FamiliarLogic.deployed();
    famProxy = await FamiliarProxy.deployed();
  });

  it("allows changing royalty information", async () => {

  });

  it("allows deleting royalty information", async () => {

  });
});

contract("FamiliarIMX", (accounts) => {
  let famAdmin, famIMX, famLogic, famProxy;
  before( async () => {
    famAdmin = await FamiliarAdmin.deployed(); 
    famIMX = await FamiliarIMX.deployed();
    famLogic = await FamiliarLogic.deployed();
    famProxy = await FamiliarProxy.deployed();
  });

  it("allows NFT minting", async () => {

  });

  it("creates NFT with correct blueprints", async () => {

  });

});

contract("FamiliarLogic", (accounts) => {
  let famAdmin, famIMX, famLogic, famProxy;
  before( async () => {
    famAdmin = await FamiliarAdmin.deployed(); 
    famIMX = await FamiliarIMX.deployed();
    famLogic = await FamiliarLogic.deployed();
    famProxy = await FamiliarProxy.deployed();
  });

  it("initializes correctly and prevent unauthorized inits", async () => {

  });

  it("provides NFT blueprint", async () => {

  });

  it("provides correct URL for NFT image", async () => {

  });

});

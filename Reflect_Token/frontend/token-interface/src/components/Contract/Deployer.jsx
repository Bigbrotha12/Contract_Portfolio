import { Card, Form, notification } from "antd";
import Web3 from "web3";
import Text from "antd/lib/typography/Text";
import { useMemo, useState } from "react";
import contractInfo from "./ABI/Aggregate.json";
import Address from "components/Address/Address";
import { useMoralis, useMoralisQuery, useChain } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import ContractMethods from "./ContractMethods";

export default function Deployer() {
  const { account, isAuthenticated } = useMoralis();
  const { chain } = useChain();
  const [responses, setResponses] = useState({});
  const { contractName, networks, abi, bytecode } = contractInfo;

  const contractAddress = useMemo(() => {
    return responses.contractAddress || networks[3].address;
  }, [responses, networks]);

  /**Live query */
  const { data } = useMoralisQuery("Events", (query) => query, [], {
    live: true,
  });

  const displayedContractFunctions = useMemo(() => {
    if (!abi) return [];
    return abi.filter((method) => method["type"] === "constructor");
  }, [abi]);

  const openNotification = ({ message, description }) => {
    notification.open({
      placement: "bottomRight",
      message,
      description,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };

  function argsArray(argument) {
    let res = new Array();
    let keys = Object.keys(argument);
    for (let i = 0; i < keys.length; i++) {
      if (argument[keys[i]][0] == "[") {
        let arr = parseArray(argument[keys[i]]);
        res.push(arr);
        continue;
      }
      res.push(argument[keys[i]]);
    }
    return res;
  }

  function parseArray(strArr) {
    let items = strArr.substring(1, strArr.length - 1);
    return items.split(",");
  }

  return (
    <div
      style={{
        margin: "auto",
        display: "flex",
        gap: "20px",
        marginTop: "25",
        width: "70vw",
      }}
    >
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Your contract: {contractName}
            <Address
              avatar="left"
              copyable
              address={contractAddress}
              size={8}
            />
          </div>
        }
        size="large"
        style={{
          width: "60%",
          boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
          border: "1px solid #e7eaf3",
          borderRadius: "0.5rem",
        }}
      >
        <Form.Provider
          onFormFinish={async (name, { forms }) => {
            const params = forms[name].getFieldsValue();
            let web3 = new Web3(Web3.givenProvider);
            console.log(web3);
            const contract = new web3.eth.Contract(abi, contractAddress);

            if (isAuthenticated) {
              await contract
                .deploy({
                  data: bytecode,
                  arguments: argsArray(params),
                })
                .send({ from: account })
                .on("transactionHash", (hash) => {
                  openNotification("Transaction Submitted", hash);
                  console.log(hash);
                })
                .on("receipt", (r) => setResponses(r));
            }
          }}
        >
          <div>
            <Text>Deploying contract to {chain?.name}</Text>
          </div>
          <ContractMethods
            displayedContractFunctions={displayedContractFunctions}
            responses={responses}
          />
        </Form.Provider>
      </Card>
      <Card
        title={"Contract Events"}
        size="large"
        style={{
          width: "40%",
          boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
          border: "1px solid #e7eaf3",
          borderRadius: "0.5rem",
        }}
      >
        {data.map((event, key) => (
          <Card
            title={"Transfer event"}
            size="small"
            style={{ marginBottom: "20px" }}
            key={key}
          >
            {getEllipsisTxt(event.attributes.transaction_hash, 14)}
          </Card>
        ))}
      </Card>
    </div>
  );
}

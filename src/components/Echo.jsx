import { createBaseAccountSDK } from "@base-org/account";
import { useCallback, useEffect, useState } from "react";
import { baseSepolia } from "viem/chains";

const Echo = () => {
  const [provider, setProvider] = useState(null);
  const [subAccount, setSubAccount] = useState(null);
  const [universalAddress, setUniversalAddress] = useState("");
  const [connected, setConnected] = useState(false);
  const [loadingSubAccount, setLoadingSubAccount] = useState(false);
  const [loadingUniversal, setLoadingUniversal] = useState(false);
  const [status, setStatus] = useState("");

  // Initialize SDK and crypto account
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const sdkInstance = createBaseAccountSDK({
          appName: "Sub Account Demo",
          appChainIds: [baseSepolia.id],
        });

        const providerInstance = sdkInstance.getProvider();
        setProvider(providerInstance);

        setStatus("SDK initialized - ready to connect");
      } catch (error) {
        console.error("SDK initialization failed:", error);
        setStatus("SDK initialization failed");
      }
    };

    initializeSDK();
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      setStatus("Provider not initialized");
      return;
    }

    setLoadingSubAccount(true);
    setStatus("Connecting wallet...");

    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
        params: [],
      });

      const universalAddr = accounts[0];
      setUniversalAddress(universalAddr);
      setConnected(true);

      const response = await provider.request({
        method: "wallet_getSubAccounts",
        params: [
          {
            account: universalAddr,
            domain: window.location.origin,
          },
        ],
      });

      const existing = response.subAccounts?.[0];
      if (existing) {
        setSubAccount(existing);
        setStatus("Connected! Existing Sub Account found");
      } else {
        setStatus("Connected! No existing Sub Account found");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setStatus("Connection failed");
    } finally {
      setLoadingSubAccount(false);
    }
  };

  const createSubAccount = async () => {
    if (!provider) {
      setStatus("Provider not initialized");
      return;
    }

    setLoadingSubAccount(true);
    setStatus("Creating Sub Account...");

    try {
      const newSubAccount = await provider.request({
        method: "wallet_addSubAccount",
        params: [
          {
            account: {
              type: "create",
            },
          },
        ],
      });

      setSubAccount(newSubAccount);
      setStatus("Sub Account created successfully!");
    } catch (error) {
      console.error("Sub Account creation failed:", error);
      setStatus("Sub Account creation failed");
    } finally {
      setLoadingSubAccount(false);
    }
  };

  const sendCalls = useCallback(
    async (calls, from, setLoadingState) => {
      if (!provider) {
        setStatus("Provider not available");
        return;
      }

      setLoadingState(true);
      setStatus("Sending calls...");

      try {
        const callsId = await provider.request({
          method: "wallet_sendCalls",
          params: [
            {
              version: "2.0",
              atomicRequired: true,
              chainId: `0x${baseSepolia.id.toString(16)}`,
              from,
              calls,
              capabilities: {},
            },
          ],
        });

        setStatus(`Calls sent! Calls ID: ${callsId}`);
      } catch (error) {
        console.error("Send calls failed:", error);
        setStatus("Send calls failed");
      } finally {
        setLoadingState(false);
      }
    },
    [provider]
  );

  const sendCallsFromSubAccount = useCallback(async () => {
    if (!subAccount) {
      setStatus("Sub account not available");
      return;
    }

    const calls = [
      {
        to: "0x4bbfd120d9f352a0bed7a014bd67913a2007a878",
        data: "0x9846cd9e",
        value: "0x0",
      },
    ];

    await sendCalls(calls, subAccount.address, setLoadingSubAccount);
  }, [sendCalls, subAccount]);

  const sendCallsFromUniversal = useCallback(async () => {
    if (!universalAddress) {
      setStatus("Universal account not available");
      return;
    }

    const calls = [
      {
        to: "0x4bbfd120d9f352a0bed7a014bd67913a2007a878",
        data: "0x9846cd9e",
        value: "0x0",
      },
    ];

    await sendCalls(calls, universalAddress, setLoadingUniversal);
  }, [sendCalls, universalAddress]);

  return (
    <div className="sub-account-demo">
      <h2>Sub Account Demo</h2>

      <div className="status">
        <p>
          <strong>Status:</strong> {status}
        </p>
        {universalAddress && (
          <p>
            <strong>Universal Account:</strong> {universalAddress}
          </p>
        )}
        {subAccount && (
          <p>
            <strong>Sub Account:</strong> {subAccount.address}</strong>
          </p>
        )}
      </div>

      <div className="actions">
        {!connected ? (
          <button
            onClick={connectWallet}
            disabled={loadingSubAccount || !provider}
            className="connect-btn"
          >
            {loadingSubAccount ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : !subAccount ? (
          <button
            onClick={createSubAccount}
            disabled={loadingSubAccount}
            className="create-btn"
          >
            {loadingSubAccount ? "Creating..." : "Add Sub Account"}
          </button>
        ) : (
          <div>
            <button
              onClick={sendCallsFromSubAccount}
              disabled={loadingSubAccount}
              className="sub-account-btn"
            >
              {loadingSubAccount ? "Sending..." : "Send Calls from Sub Account"}
            </button>
            <button
              onClick={sendCallsFromUniversal}
              disabled={loadingUniversal}
              className="universal-btn"
            >
              {loadingUniversal
                ? "Sending..."
                : "Send Calls from Universal Account"}
            </button>
          </div>
        )}
      </div>

  
    </div>
  );
}


  return (
    <div className="flex flex-col min-h-[100vh] w-[100%] p-10">
      <div className="self-end">
        {isSignedIn && (
          <div className="bg-white text-black flex items-center gap-3 p-3 rounded-md shadow">
            ✅ Connected:
            <span className="font-mono text-sm">{shortenAddress(user)}</span>
            <button
              onClick={disconnectWallet}
              className="ml-2 text-sm bg-red-500 text-white px-3 py-1 rounded-md"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
      <div className="inline-flex items-center p-[2px] bg-[radial-gradient(circle_at_center,_#FFFFFF80,_#0000ff5f)] lg:w-[30%] md:w-[60%] w-[100%] rounded-[21px] shadow-[20px] m-auto">
        <div className="p-8 w-[100%] rounded-[21px] bg-black">
          <div className="text-center">
            {!isSignedIn ? (
              <h1 className="lg:text-[36px] md:text-[28px] text-[22px] font-bold flex items-center justify-center bg-gradient-to-b from-[#211f92] to-[#7096ff] text-transparent bg-clip-text">
                Welcome to Echo <GiMegaphone className="text-white ml-3" />
              </h1>
            ) : (
              <h1 className="lg:text-[28px] md:text-[28px] text-[22px] font-bold bg-gradient-to-b from-[#211f92] to-[#7096ff] text-transparent bg-clip-text">
                Join the EchoList
              </h1>
            )}
            <p className="text-[12px] w-[80%] mx-auto text-gray-300">
              Let your voice echo for a cause. Join the Echo List, powered by
              Base.
            </p>
          </div>
          {isSignedIn && (
            <div className="my-8">
              <p className="mb-2">Username: </p>
              <input
                type="text"
                value={username}
                placeholder="Enter a username"
                className="p-3 rounded-md mb-3 border border-white/20 w-[100%]"
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                className="bg-blue-800 p-3 rounded-md w-[100%]"
                onClick={joinEchoList}
                disabled={loading}
              >
                {loading ? "Processing..." : "Join List"}
              </button>
            </div>
          )}
          <div className="my-6">
            {!isSignedIn && (
              <SignInWithBaseButton
                align="center"
                variant="solid"
                onClick={handleSignIn}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Echo;

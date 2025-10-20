"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GiMegaphone } from "react-icons/gi";
import { baseAccountSdk } from "@/constants/walletService";
import { SignInWithBaseButton } from "@base-org/account-ui/react";
import {
  handleTransaction,
  checkPaymasterSupport,
} from "@/constants/paymentService";
import { toast } from "react-toastify";

const Echo = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
    try {
      const sdk = baseAccountSdk();
      const provider = sdk?.getProvider();

      if (!provider) {
        throw new Error(
          "Provider not found. Ensure Base Account SDK initialized correctly."
        );
      }
      await sdk.getProvider().request({ method: "wallet_connect" });
      setIsSignedIn(true);

      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) 

      if (!accounts || accounts.length === 0) {
        throw new Error("No account found after connection");
      }

      const address = accounts[0];
      setUser(address);
      setIsSignedIn(true);

      localStorage.setItem("baseUser", address);
      localStorage.setItem("isSignedIn", "true");

      console.log("✅ User signed in:", address);
    } catch (error) {
      console.error("❌ Sign-in failed:", error);
      setIsSignedIn(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("baseUser");
    const signedIn = localStorage.getItem("isSignedIn") === "true";

    if (storedUser && signedIn) {
      setUser(storedUser);
      setIsSignedIn(true);
      console.log("🔁 Session restored:", storedUser);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      localStorage.removeItem("baseUser");
      localStorage.removeItem("isSignedIn");
      setUser(null);
      setIsSignedIn(false);

      const sdk = baseAccountSdk();
      const provider = sdk?.getProvider();

      if (provider && provider.session) {
        if (typeof provider.session.reset === "function") {
          await provider.session.reset();
          console.log("✅ Provider session reset");
        }
      }

      console.log("✅ User disconnected");
    } catch (error) {
      console.error("❌ Disconnect failed:", error);
    }
  }, []);

  const joinEchoList = async () => {
    try {
      setLoading(true);

      const paymasterSupported = await checkPaymasterSupport();
        if (!paymasterSupported) {
          console.warn("Paymaster not supported, transaction may fail");
      }

      const tx = await handleTransaction(username);
      console.log("Transaction result:", tx);
      alert("✅ Joined EchoList successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to join EchoList");
    } finally {
      setLoading(false);
    }    
  };

  const shortenAddress = (address) =>
    `${address?.slice(0, 6)}...${address?.slice(-4)}`;

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

import React from "react";
import { defaultValues } from "./constants";
import { ICoin98Context } from "./types";

export const Coin98Context = React.createContext<ICoin98Context>(defaultValues)

export const useCoin98 = () => React.useContext(Coin98Context)

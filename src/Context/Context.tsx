import React from 'react';

export type ChampionSelection = {
    value: string;
    label: string;
};

export type Data = {
    champData: ChampionSelection[],
    patch: string,
    championToImage: Map<string, any>,
    selectedChampions: string[],
    loading: boolean
}

export default React.createContext<Data>({
    champData: [],
    patch: '',
    championToImage: new Map<string, any>(),
    selectedChampions: [],
    loading: true
});
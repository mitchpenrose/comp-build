import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import Context, { ChampionSelection } from '../Context/Context'
import Select from 'react-select'
import { getData } from '../Services/services'
import { ReactComponent as Cancel } from '../icons/cancel.svg'

const Circle = styled.div<{ $borderColor: string; }>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
    width: 150px;
    border-radius: 50%;
    border: 2px solid ${props => props.$borderColor};
    overflow: hidden;
    position: relative;
    margin-top: 10px;
    background-color: #3B444B;

    img {
        width: 120%;
        height: 120%;
        object-fit: cover;
    }
`

const ConfusedButton = styled.div<{ $color: string }>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 50px;
    border-radius: 50%;
    border: 2px solid yellow;
    overflow: hidden;
    position: absolute;
    cursor: pointer;
    color: yellow;
    font-size: xx-large;
    user-select: none;
    left: ${props => props.$color === 'red' ? 'auto' : '-11px'};
    right: ${props => props.$color === 'blue' ? 'auto' : '-11px'};
    top: 47px;
`

const PositionLabel = styled.div<{ $color: string }>`
    font-size: xx-large;
    position: absolute;
    top: 50px;
    // left: 50px;
    left: ${props => props.$color === 'red' ? 'auto' : '50px'};
    right: ${props => props.$color === 'blue' ? 'auto' : '50px'};
    color: ${props => props.$color};
`

const Container = styled.div`
    display: flex;
`

const StyledSelect = styled(Select) <{ $color: string, $selected: boolean }>`
    width: ${props => props.$selected ? '150.5px' : '200px'};
    margin: auto;
    margin-right: ${props => props.$color === 'blue' ? '0px' : '20px'};
    margin-left: ${props => props.$color === 'red' ? '0px' : '20px'};
    color: #808080;
    .css-13cymwt-control{
        border-color: ${props => props.$color};
        background-color: #3B444B;
    }
    .css-t3ipsp-control{
        border-color: ${props => props.$color} !important;
        background-color: #3B444B;
        box-shadow: none;
    }
    .css-1nmdiq5-menu{
        background-color: #3B444B;
    }
    .css-d7l1ni-option{
        background-color: #54616b;
    }
    .css-tr4s17-option{
        background-color: #3B444B;
    }
    .css-1dimb5e-singleValue{
        color: #808080;
    }
    .css-166bipr-Input{
        color: #808080;
    }
`

const CancelBox = styled.div<{$color: string}>`
    border: 1px solid yellow;
    border-radius: 3px;
    position: relative;
    width: 35px;
    margin-right: ${props => props.$color === 'red' ? '13px' : '0px'};
    margin-left: ${props => props.$color === 'blue' ? '13px' : '0px'};
    cursor: pointer;
`

const CancelIcon = styled(Cancel)`
    position: absolute;
    top: 2.25px;
    left: 1.45px;
`

export type CallbackData = {
    championPosition: string,
    championName: string,
    matchupData: any
}

interface Props {
    color: string
    position: string
    dataCallback: (data: CallbackData) => void
    bestChampionCallback: (color: string, position: string) => void
    setPickedChamp: (champ: string) => void
    selectedChampion?: string | null
    clearSelectedChampion?: () => void  
}


const ChampionSelect = ({ color, position, dataCallback, bestChampionCallback, selectedChampion, setPickedChamp, clearSelectedChampion }: Props) => {

    const data = useContext(Context)
    const [championSelection, setChampionSelection] = useState<any>(null)
    const [availableChampions, setAvailableChampions] = useState<ChampionSelection[]>([])

    useEffect(() => {
        if (data.champData.length > 0) {
            setAvailableChampions(data.champData.filter((cd) => {
                if (championSelection?.value === cd.value) {
                    return true
                }
                return !data.selectedChampions.includes(cd.value)
            }))
        }


    }, [data.champData, data.selectedChampions])

    useEffect(() => {
        if (selectedChampion && data.champData.length > 0) {
            selectChampion(data.champData.find((data) => data.value === selectedChampion))
        }
    }, [selectedChampion, data.champData])

    const clearChampion = () => {
        selectChampion(null)
        selectedChampion = undefined
        if(clearSelectedChampion){
            clearSelectedChampion()
        }
    }



    const getDropdown = (color: string) => {
        return <div style={{ margin: "auto", position: "relative" }}>
            <div style={{ display: "flex" }}>
                {(championSelection !== null && color === 'red') && <CancelBox $color={color} onClick={clearChampion}><CancelIcon /></CancelBox>}
                <StyledSelect $color={color} $selected={championSelection !== null} options={availableChampions} onChange={(selection: any) => selectChampion(selection)} value={championSelection} />
                {(championSelection !== null && color === 'blue') && <CancelBox $color={color} onClick={clearChampion}><CancelIcon /></CancelBox>}
            </div>
            <ConfusedButton $color={color} onClick={() => bestChampionCallback(color, position)}>?</ConfusedButton>
            <PositionLabel $color={color}>{position}</PositionLabel>
        </div>
    }

    const getMatchupData = async (championId: string, championName: string) => {
        if(!championId){
            dataCallback({championPosition: '', championName: '', matchupData: null})
            return
        }
        const championPosition = position + "_" + championId
        const json = await getData(championPosition)
        dataCallback({ championPosition: championPosition, championName: championName, matchupData: json })
    }

    const selectChampion = async (selection: any) => {
        //debugger
        setPickedChamp(selection?.value)
        setChampionSelection(selection)
        getMatchupData(selection?.value, selection?.label)
    }

    return <Container>
        {color === 'red' && getDropdown('red')}
        <Circle $borderColor={color}>
            {championSelection !== null && <img src={data.championToImage.get(championSelection.value).src} />/*data.championToImage.get(championSelection)<img src={`http://ddragon.leagueoflegends.com/cdn/${data.patch}/img/champion/${championSelection}.png`} />*/}
        </Circle>
        {color === 'blue' && getDropdown('blue')}
    </Container>
}

export default ChampionSelect
import { useContext, useEffect, useMemo, useState } from "react"
import Context from "../Context/Context"
import { JSX } from "react/jsx-runtime"
import { getColorForPercentage } from "../Utils/utils"
import styled from "styled-components"
import Select, { ControlProps, GroupBase, components } from 'react-select'


const StyledSelect = styled(Select)`
    width: 200px;
    color: #808080;
    .css-13cymwt-control{
        border-color: #54616b;
        background-color: #3B444B;
    }
    .css-t3ipsp-control{
        border-color: #54616b !important;
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

const positions = [{ value: 'ALL POSITIONS', label: 'ALL POSITIONS' }, { value: 'TOP', label: 'TOP' }, { value: 'JUNGLE', label: 'JUNGLE' }, { value: 'MID', label: 'MID' }, { value: 'ADC', label: 'ADC' }, { value: 'SUPPORT', label: 'SUPPORT' },]
const sorting = [{ value: 'WIN RATE', label: 'WIN RATE' }, { value: 'PLAY RATE', label: 'PLAY RATE' }]
interface Props {
    championWinRates: any
}

const WinRates = ({ championWinRates }: Props) => {

    interface ChampStat { key: string, wins: number, losses: number, pct: number }
    interface value {wins: number, losses: number}

    const data = useContext(Context)
    const [selectedPosition, setSelectedPosition] = useState(positions[0])
    const [selectedSort, setSelectedSort] = useState(sorting[0])
    const [currentChampStats, setCurrentChampStats] = useState<ChampStat[]>([])
    const [filterValue, setFilterValue] = useState<string>('')

    const getColorForGames = (games: number) => {
        if(games < 500){
            return 'rgb(255,0,0)'
        }
        if(games < 1000){
            return 'rgb(255,255,0)'
        }
        return 'rgb(0,255,0)'
    }

    useMemo(() => {
        if (data.championToImage.size === 0 || selectedPosition.value !== 'ALL POSITIONS') {
            return
        }
        const anyPositionMap = new Map<string, value>()
        positions.forEach((position) => {
            if(position.value !== 'ALL POSITIONS'){
                championWinRates[position.value].forEach((champStat: ChampStat) => {
                    const toAddWins = anyPositionMap.get(champStat.key)?.wins === undefined ? 0 : anyPositionMap.get(champStat.key)!.wins
                    const toAddLosses = anyPositionMap.get(champStat.key)?.losses === undefined ? 0 : anyPositionMap.get(champStat.key)!.losses
                    anyPositionMap.set(champStat.key, {wins: toAddWins + champStat.wins, losses: toAddLosses + champStat.losses})
                })
            }
        })
        const champStats: ChampStat[] = []
        anyPositionMap.forEach((value, key) => {
            champStats.push({key: key, wins: value.wins, losses: value.losses, pct: value.wins / (value.wins + value.losses)})
        })
        champStats.sort((a, b) => { return b.pct - a.pct })
        setCurrentChampStats(champStats)
    }, [data.championToImage, selectedPosition])

    useMemo(() => {
        if (data.championToImage.size === 0 || selectedPosition.value === 'ALL POSITIONS') {
            return
        }
        setCurrentChampStats(championWinRates[selectedPosition.value])
    }, [data.championToImage, selectedPosition])

    const sortedFilteredData = useMemo(() => {
        if(selectedSort.value === 'WIN RATE'){
            currentChampStats.sort((a, b) => { return b.pct - a.pct })
        }
        else if(selectedSort.value === 'PLAY RATE'){
            currentChampStats.sort((a, b) => { return (b.wins + b.losses) - (a.wins + a.losses) })
        }
        let filtered = currentChampStats
        if(filterValue !== ''){
            const filterOn = filterValue.toLowerCase()
            filtered = currentChampStats.filter((ccs) => {
                const legitName = data.champData.find((data) => data.value === ccs.key)?.label.toLowerCase()
                return legitName?.includes(filterOn) || legitName?.replaceAll('\'', '').replaceAll(' ', '').replaceAll('.', '').includes(filterOn)
            })
        }

        let row: JSX.Element[] = []
        let rows: JSX.Element[][] = []
        const length = filtered.length
        filtered.forEach((champStats: ChampStat, index: number) => {
            row.push(<div style={{ marginLeft: '3px', position: 'relative' }} key={index}>
                <img src={data.championToImage.get(champStats.key).src} />
                <div style={{ position: "absolute", top: "0px", userSelect: "none", backgroundColor: "rgba(125, 125, 125, 0.5)"}}>{data.champData.find((data) => data.value === champStats.key)?.label}</div>
                <div style={{ position: "absolute", bottom: "25px", color: getColorForPercentage(champStats.pct), userSelect: "none", backgroundColor: "black" }} key={index}>{(champStats.pct * 100).toFixed(2) + "%"}</div>
                <div style={{ position: "absolute", bottom: "5px", color: getColorForGames(champStats.wins+champStats.losses), userSelect: "none", backgroundColor: "black" }} key={(index+1)*2}>{`${champStats.wins}/${champStats.wins+champStats.losses}`}</div>
            </div>)
            if (row.length === 9 || index === length - 1) {
                rows.push(row)
                row = []
            }
        })
        return rows.map((r, index) => {
            return <div key={index} style={{ display: 'flex' }}>{r}</div>
        })
    }, [currentChampStats, selectedSort, filterValue])

    return <div style={{ width: '1110px', margin: 'auto', padding: '50px' }}>
        <div style={{display: 'flex', marginBottom: '10px'}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '3px', marginRight: '10px', fontSize: 'large'}}>Position</div>
            <StyledSelect options={positions} onChange={(selected) => setSelectedPosition(selected as { value: string, label: string })} value={selectedPosition} />
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '20px', marginRight: '10px', fontSize: 'large'}}>Sort By</div>
            <StyledSelect options={sorting} onChange={(selected) => {setSelectedSort(selected as { value: string, label: string })}} value={selectedSort} />
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '20px', marginRight: '10px', fontSize: 'large'}}>Search</div>
            <StyledSelect
                isSearchable={true}
                isClearable={false}
                components={{
                DropdownIndicator: null,
                IndicatorSeparator: null,
                }}
                onInputChange={(value, action) => {
                    if(action.action === 'input-change'){
                        setFilterValue(value)
                    }
                }}
                onFocus={() => {
                    setFilterValue('')
                }}
                onBlur={() => null}
                options={[]}
                menuIsOpen={false}
                value={{value: '', label: filterValue}}
            />
        </div>
        {sortedFilteredData}
    </div>
}

export default WinRates
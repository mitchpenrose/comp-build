import { ReactElement, useContext, useEffect, useMemo, useState } from "react"
import Context, { ChampionSelection } from "../Context/Context"
import { JSX } from "react/jsx-runtime"
import { getColorForPercentage } from "../Utils/utils"
import styled from "styled-components"
import Select, { ControlProps, GroupBase, components } from 'react-select'
import Modal from "./Modal"
import { getChampData, getData } from "../Services/services"


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

const positions = [{ value: 'All Positions', label: 'ALL POSITIONS' }, { value: 'Top', label: 'TOP' }, { value: 'Jungle', label: 'JUNGLE' }, { value: 'Mid', label: 'MID' }, { value: 'ADC', label: 'ADC' }, { value: 'Support', label: 'SUPPORT' },]
const sorting = [{ value: 'WIN RATE', label: 'WIN RATE' }, { value: 'PLAY RATE', label: 'PLAY RATE' }]
const opponentOrTeam = [{ value: 'Versus', label: 'VERSUS' }, { value: 'Paired With', label: 'PAIRED WITH' }]
interface Props {
    championWinRates: any
}

const WinRates = ({ championWinRates }: Props) => {

    interface ChampStat { key: string, wins: number, losses: number, pct: number }
    interface value { wins: number, losses: number }

    const data = useContext(Context)
    const [selectedPosition, setSelectedPosition] = useState(positions[0])
    const [selectedSort, setSelectedSort] = useState(sorting[0])
    const [currentChampStats, setCurrentChampStats] = useState<ChampStat[]>([])
    const [filterValue, setFilterValue] = useState<string>('')
    const [showDataModal, setShowDataModal] = useState<boolean>(false)
    const [selectedChampion, setSelectedChampion] = useState<ChampionSelection>()
    const [modalTitle, setModalTitle] = useState<ReactElement>(<></>)
    const [selectedModalPosition, setSelectedModalPosition] = useState(positions[0])
    const [selectedCompareModalPosition, setSelectedCompareModalPosition] = useState(positions[0])
    const [selectedOpponentOrTeam, setSelectedOpponentOrTeam] = useState(opponentOrTeam[0])
    const [champData, setChampData] = useState(null)

    const getColorForGames = (games: number) => {
        if (games < 500) {
            return 'rgb(255,0,0)'
        }
        if (games < 1000) {
            return 'rgb(255,255,0)'
        }
        return 'rgb(0,255,0)'
    }

    useMemo(() => {
        if (selectedPosition.label !== 'ALL POSITIONS') {
            return
        }
        const anyPositionMap = new Map<string, value>()
        positions.forEach((position) => {
            if (position.label !== 'ALL POSITIONS') {
                championWinRates[position.label].forEach((champStat: ChampStat) => {
                    const toAddWins = anyPositionMap.get(champStat.key)?.wins === undefined ? 0 : anyPositionMap.get(champStat.key)!.wins
                    const toAddLosses = anyPositionMap.get(champStat.key)?.losses === undefined ? 0 : anyPositionMap.get(champStat.key)!.losses
                    anyPositionMap.set(champStat.key, { wins: toAddWins + champStat.wins, losses: toAddLosses + champStat.losses })
                })
            }
        })
        const champStats: ChampStat[] = []
        anyPositionMap.forEach((value, key) => {
            champStats.push({ key: key, wins: value.wins, losses: value.losses, pct: value.wins / (value.wins + value.losses) })
        })
        champStats.sort((a, b) => { return b.pct - a.pct })
        setCurrentChampStats(champStats)
    }, [selectedPosition])

    useMemo(() => {
        if (selectedPosition.label === 'ALL POSITIONS') {
            return
        }
        setCurrentChampStats(championWinRates[selectedPosition.label])
    }, [selectedPosition])

    const clickChampion = async (champName: string) => {
        setChampData(null)
        const selection = data.champData.find((data) => data.label === champName)
        setShowDataModal(true)
        setSelectedChampion(selection)
        setSelectedModalPosition(selectedPosition)
        setSelectedOpponentOrTeam(opponentOrTeam[0])
        setSelectedCompareModalPosition(selectedPosition)
        if (selectedPosition.label === 'ALL POSITIONS') {
            setChampData(await getChampData(selection?.value!))
        }
        else {
            setChampData(await getData(`${selectedPosition.label}_${selection?.value!}`))
        }
    }

    useMemo(async () => {
        //debugger
        if (!showDataModal) {
            return
        }
        if (selectedModalPosition.label === 'ALL POSITIONS') {
            setChampData(await getChampData(selectedChampion!.value!))
        }
        else {
            setChampData(await getData(`${selectedModalPosition.label}_${selectedChampion!.value!}`))
        }
    }, [selectedModalPosition.label, selectedChampion])

    const modalJsx = useMemo(() => {
        if (!champData) {
            return
        }
        const teamOrOpponent = selectedOpponentOrTeam.label === 'VERSUS' ? 'OPPONENT' : 'TEAM'
        const championToData = new Map<string, value>()
        if (selectedCompareModalPosition.label === "ALL POSITIONS") {
            Object.entries(champData!).forEach(([key, value]) => {
                const split = key.split('_')
                const id = split[split.length - 1]
                const too = split[0]
                if (id !== selectedChampion?.value && teamOrOpponent === too) {
                    const toAddWins = championToData.get(id)?.wins === undefined ? 0 : championToData.get(id)!.wins
                    const toAddLosses = championToData.get(id)?.losses === undefined ? 0 : championToData.get(id)!.losses
                    championToData.set(id, { wins: toAddWins + (value as value).wins, losses: toAddLosses + (value as value).losses })
                }
            })
        }
        else {
            Object.entries(champData!).forEach(([key, value]) => {
                const split = key.split('_')
                const id = split[split.length - 1]
                const too = split[0]
                const pos = split[1]
                if (id !== selectedChampion?.value && teamOrOpponent === too && selectedCompareModalPosition.label === pos) {
                    const toAddWins = championToData.get(id)?.wins === undefined ? 0 : championToData.get(id)!.wins
                    const toAddLosses = championToData.get(id)?.losses === undefined ? 0 : championToData.get(id)!.losses
                    championToData.set(id, { wins: toAddWins + (value as value).wins, losses: toAddLosses + (value as value).losses })
                }
            })
        }

        const champStats: ChampStat[] = []
        championToData.forEach((value, key) => {
            champStats.push({ key: key, wins: value.wins, losses: value.losses, pct: value.wins / (value.wins + value.losses) })
        })
        champStats.sort((a, b) => { return b.pct - a.pct })

        let row: JSX.Element[] = []
        let rows: JSX.Element[][] = []
        const length = champStats.length
        champStats.forEach((champStats: ChampStat, index: number) => {
            const name = data.champData.find((data) => data.value === champStats.key)?.label
            row.push(<div style={{ marginLeft: '3px', position: 'relative', cursor: 'pointer' }} key={index} onClick={() => clickChampion(name!)}>
                <img src={data.championToImage.get(champStats.key).src} />
                <div style={{ position: "absolute", top: "0px", userSelect: "none", backgroundColor: "rgba(125, 125, 125, 0.5)" }}>{name}</div>
                <div style={{ position: "absolute", bottom: "25px", color: getColorForPercentage(champStats.pct), userSelect: "none", backgroundColor: "black" }} key={index}>{(champStats.pct * 100).toFixed(2) + "%"}</div>
                <div style={{ position: "absolute", bottom: "5px", color: getColorForGames(champStats.wins + champStats.losses), userSelect: "none", backgroundColor: "black" }} key={(index + 1) * 2}>{`${champStats.wins}/${champStats.wins + champStats.losses}`}</div>
            </div>)
            if (row.length === 9 || index === length - 1) {
                rows.push(row)
                row = []
            }
        })
        return rows.map((r, index) => {
            return <div key={index} style={{ display: 'flex' }}>{r}</div>
        })
    }, [champData, selectedOpponentOrTeam.label, selectedCompareModalPosition.label])

    const sortedFilteredData = useMemo(() => {
        if (selectedSort.label === 'WIN RATE') {
            currentChampStats.sort((a, b) => { return b.pct - a.pct })
        }
        else if (selectedSort.label === 'PLAY RATE') {
            currentChampStats.sort((a, b) => { return (b.wins + b.losses) - (a.wins + a.losses) })
        }
        let filtered = currentChampStats
        if (filterValue !== '') {
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
            const name = data.champData.find((data) => data.value === champStats.key)?.label
            row.push(<div style={{ marginLeft: '3px', position: 'relative', cursor: 'pointer' }} key={index} onClick={() => clickChampion(name!)}>
                <img src={data.championToImage.get(champStats.key).src} />
                <div style={{ position: "absolute", top: "0px", userSelect: "none", backgroundColor: "rgba(125, 125, 125, 0.5)" }}>{name}</div>
                <div style={{ position: "absolute", bottom: "25px", color: getColorForPercentage(champStats.pct), userSelect: "none", backgroundColor: "black" }} key={index}>{(champStats.pct * 100).toFixed(2) + "%"}</div>
                <div style={{ position: "absolute", bottom: "5px", color: getColorForGames(champStats.wins + champStats.losses), userSelect: "none", backgroundColor: "black" }} key={(index + 1) * 2}>{`${champStats.wins}/${champStats.wins + champStats.losses}`}</div>
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

    return <div style={{display: 'flex'}}>
        <div style={{minWidth: '195px'}}/>
        <div style={{ width: '1110px', margin: 'auto', padding: '50px' }}>
            <Modal width={"1110px"} isOpen={showDataModal} onClose={() => setShowDataModal(false)} title={<div><div>{`${selectedChampion?.label} In ${selectedModalPosition.value} ${selectedOpponentOrTeam.value} Champions In ${selectedCompareModalPosition.value}`}</div><div style={{ display: 'flex', justifyContent: 'center' }}>
                <StyledSelect options={data.champData} onChange={(selected) => { setSelectedChampion(selected as ChampionSelection) }} value={selectedChampion} />
                <StyledSelect options={positions} onChange={(selected) => setSelectedModalPosition(selected as { value: string, label: string })} value={selectedModalPosition} />
                <StyledSelect options={opponentOrTeam} onChange={(selected) => setSelectedOpponentOrTeam(selected as { value: string, label: string })} value={selectedOpponentOrTeam} />
                <StyledSelect options={positions} onChange={(selected) => setSelectedCompareModalPosition(selected as { value: string, label: string })} value={selectedCompareModalPosition} />
            </div></div>}>
                {modalJsx}
            </Modal>
            <div style={{ display: 'flex', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '3px', marginRight: '10px', fontSize: 'large' }}>Position</div>
                <StyledSelect options={positions} onChange={(selected) => { setSelectedPosition(selected as { value: string, label: string }); setSelectedModalPosition(selected as { value: string, label: string }) }} value={selectedPosition} />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '20px', marginRight: '10px', fontSize: 'large' }}>Sort By</div>
                <StyledSelect options={sorting} onChange={(selected) => { setSelectedSort(selected as { value: string, label: string }) }} value={selectedSort} />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '20px', marginRight: '10px', fontSize: 'large' }}>Search</div>
                <StyledSelect
                    isSearchable={true}
                    isClearable={false}
                    components={{
                        DropdownIndicator: null,
                        IndicatorSeparator: null,
                    }}
                    onInputChange={(value, action) => {
                        if (action.action === 'input-change') {
                            setFilterValue(value)
                        }
                    }}
                    onFocus={() => {
                        setFilterValue('')
                    }}
                    onBlur={() => null}
                    options={[]}
                    menuIsOpen={false}
                    value={{ value: '', label: filterValue }}
                />
            </div>
            {sortedFilteredData}
        </div>
        <div style={{minWidth: '195px'}}/>
    </div>
}

export default WinRates
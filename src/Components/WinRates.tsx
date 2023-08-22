import { ReactElement, useContext, useEffect, useMemo, useState } from "react"
import Context, { ChampionSelection } from "../Context/Context"
import { JSX } from "react/jsx-runtime"
import { getColorForPercentage } from "../Utils/utils"
import styled from "styled-components"
import Select from 'react-select'
import Modal from "./Modal"
import { getChampData, getData } from "../Services/services"
import Input from "./Input"


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
const MarginLeftRight = styled.div`
    margin-left: 10px;
    margin-right: 10px;
`
const CenteredMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 100px;
`
const InputDescription = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 20px;
    margin-right: 10px;
    font-size: large;
`
const InputSection = styled.div`
    display: flex;
    margin-bottom: 10px;
`
const AdBlock = styled.div`
    min-width: 195px;
`
const MainContainer = styled.div`
    width: 1110px;
    margin: auto;
    padding: 50px;
`
const ModalInputModifiers = styled.div`
    display: flex;
    margin-top: 20px;
    margin-bottom: 10px;
`
const ModalTitleInputModifiers = styled.div`
    display: flex;
    justify-content: center;
`
const TitleStyle = styled.div`
    text-align: center;
    margin-bottom: 15px;
    font-size: larger;
`
const Flex = styled.div`
    display: flex;
`
const RowStyle = styled.div`
    margin-left: 3px;
    position: relative;
    cursor: pointer;
`
const ChampionInfo = styled.div`
    position: absolute;
    user-select: none;
    background-color: black;
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
    const [selectedModalSort, setSelectedModalSort] = useState(sorting[0])
    const [currentChampStats, setCurrentChampStats] = useState<ChampStat[]>([])
    const [filterValue, setFilterValue] = useState<string>('')
    const [filterModalValue, setFilterModalValue] = useState<string>('')
    const [gamesGreaterModal, setGamesGreaterModal] = useState<number>(0)
    const [gamesGreater, setGamesGreater] = useState<number>(0)
    const [showDataModal, setShowDataModal] = useState<boolean>(false)
    const [selectedChampion, setSelectedChampion] = useState<ChampionSelection>()
    const [selectedModalPosition, setSelectedModalPosition] = useState(positions[0])
    const [selectedCompareModalPosition, setSelectedCompareModalPosition] = useState(positions[0])
    const [selectedOpponentOrTeam, setSelectedOpponentOrTeam] = useState(opponentOrTeam[0])
    const [champData, setChampData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

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
        setIsLoading(true)
        if (selectedPosition.label === 'ALL POSITIONS') {
            setChampData(await getChampData(selection?.value!))
        }
        else {
            setChampData(await getData(`${selectedPosition.label}_${selection?.value!}`))
        }
        setIsLoading(false)
    }

    const updateData = async (smp: string, sc: string) => {
        setIsLoading(true)
        if (smp === 'ALL POSITIONS') {
            setChampData(await getChampData(sc))
        }
        else {
            setChampData(await getData(`${smp}_${sc}`))
        }
        setIsLoading(false)
    }

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
        if (selectedModalSort.value === 'WIN RATE') {
            champStats.sort((a, b) => { return b.pct - a.pct })
        }
        else if (selectedModalSort.value === 'PLAY RATE') {
            champStats.sort((a, b) => { return (b.wins + b.losses) - (a.wins + a.losses) })
        }

        let filtered = champStats
        if (filterModalValue !== '') {
            const filterOn = filterModalValue.toLowerCase()
            filtered = champStats.filter((ccs) => {
                const legitName = data.champData.find((data) => data.value === ccs.key)?.label.toLowerCase()
                return legitName?.includes(filterOn) || legitName?.replaceAll('\'', '').replaceAll(' ', '').replaceAll('.', '').includes(filterOn)
            })
        }
        filtered = filtered.filter((f) => f.wins + f.losses > gamesGreaterModal)


        let row: JSX.Element[] = []
        let rows: JSX.Element[][] = []
        const length = filtered.length
        filtered.forEach((champStats: ChampStat, index: number) => {
            const name = data.champData.find((data) => data.value === champStats.key)?.label
            row.push(<RowStyle key={index} onClick={() => clickChampion(name!)}>
                <img src={data.championToImage.get(champStats.key).src} />
                <ChampionInfo style={{top: "0px", backgroundColor: "rgba(125, 125, 125, 0.5)" }}>{name}</ChampionInfo>
                <ChampionInfo style={{bottom: "25px", color: getColorForPercentage(champStats.pct) }} key={index}>{(champStats.pct * 100).toFixed(2) + "%"}</ChampionInfo>
                <ChampionInfo style={{bottom: "5px", color: getColorForGames(champStats.wins + champStats.losses) }} key={(index + 1) * 2}>{`${champStats.wins}/${champStats.wins + champStats.losses}`}</ChampionInfo>
            </RowStyle>)
            if (row.length === 9 || index === length - 1) {
                rows.push(row)
                row = []
            }
        })
        if (rows.length === 0) {
            return <CenteredMessage>No Data</CenteredMessage>
        }
        return rows.map((r, index) => {
            return <Flex key={index} >{r}</Flex>
        })
    }, [champData, selectedOpponentOrTeam.label, selectedCompareModalPosition.label, selectedModalSort.label, filterModalValue, gamesGreaterModal])

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
        filtered = filtered.filter((f) => f.wins + f.losses > gamesGreater)

        let row: JSX.Element[] = []
        let rows: JSX.Element[][] = []
        const length = filtered.length
        filtered.forEach((champStats: ChampStat, index: number) => {
            const name = data.champData.find((data) => data.value === champStats.key)?.label
            row.push(<RowStyle key={index} onClick={() => clickChampion(name!)}>
                <img src={data.championToImage.get(champStats.key).src} />
                <ChampionInfo style={{ top: "0px", backgroundColor: "rgba(125, 125, 125, 0.5)" }}>{name}</ChampionInfo>
                <ChampionInfo style={{ bottom: "25px", color: getColorForPercentage(champStats.pct) }} key={index}>{(champStats.pct * 100).toFixed(2) + "%"}</ChampionInfo>
                <ChampionInfo style={{ bottom: "5px", color: getColorForGames(champStats.wins + champStats.losses) }} key={(index + 1) * 2}>{`${champStats.wins}/${champStats.wins + champStats.losses}`}</ChampionInfo>
            </RowStyle>)
            if (row.length === 9 || index === length - 1) {
                rows.push(row)
                row = []
            }
        })
        if (rows.length === 0) {
            return <CenteredMessage>No Data</CenteredMessage>
        }
        return rows.map((r, index) => {
            return <Flex key={index}>{r}</Flex>
        })
    }, [currentChampStats, selectedSort, filterValue, gamesGreater])

    const closeModal = () => {
        setShowDataModal(false)
        setSelectedModalSort(sorting[0])
        setFilterModalValue('')
    }

    return <Flex>
        <AdBlock />
        <MainContainer>
            <Modal width={"1110px"} isOpen={showDataModal} onClose={closeModal} titleStyle={{}} title={
                <div>
                    <TitleStyle>{`${selectedChampion?.label} In ${selectedModalPosition.value} ${selectedOpponentOrTeam.value} Champions In ${selectedCompareModalPosition.value}`}</TitleStyle>
                    <ModalTitleInputModifiers>
                        <MarginLeftRight><StyledSelect options={data.champData} onChange={(selected) => { setSelectedChampion(selected as ChampionSelection); updateData(selectedModalPosition.label, (selected as ChampionSelection).value)  }} value={selectedChampion} /></MarginLeftRight>
                        <MarginLeftRight><StyledSelect options={positions} onChange={(selected) => {setSelectedModalPosition(selected as { value: string, label: string }); updateData((selected  as { value: string, label: string }).label, selectedChampion!.value!)}} value={selectedModalPosition} /></MarginLeftRight>
                        <MarginLeftRight><StyledSelect options={opponentOrTeam} onChange={(selected) => setSelectedOpponentOrTeam(selected as { value: string, label: string })} value={selectedOpponentOrTeam} /></MarginLeftRight>
                        <MarginLeftRight><StyledSelect options={positions} onChange={(selected) => setSelectedCompareModalPosition(selected as { value: string, label: string })} value={selectedCompareModalPosition} /></MarginLeftRight>
                    </ModalTitleInputModifiers>
                    <ModalInputModifiers>
                        <InputDescription>Sort By</InputDescription>
                        <StyledSelect options={sorting} onChange={(selected) => { setSelectedModalSort(selected as { value: string, label: string }) }} value={selectedModalSort} />
                        <InputDescription>Search</InputDescription>
                        <Input setValue={setFilterModalValue} value={filterModalValue} />
                        <InputDescription>{`Number of Games >`}</InputDescription>
                        <Input width='60px' setValue={setGamesGreaterModal} value={gamesGreaterModal} defaultValue={0} type='number' maxLength={8} />
                    </ModalInputModifiers>
                </div>}>
                {isLoading ? <CenteredMessage>Loading...</CenteredMessage> : modalJsx}
            </Modal>
            <InputSection>
                <InputDescription style={{ marginLeft: '3px' }}>Position</InputDescription>
                <StyledSelect options={positions} onChange={(selected) => { setSelectedPosition(selected as { value: string, label: string })}} value={selectedPosition} />
                <InputDescription>Sort By</InputDescription>
                <StyledSelect options={sorting} onChange={(selected) => { setSelectedSort(selected as { value: string, label: string }) }} value={selectedSort} />
                <InputDescription>Search</InputDescription>
                <Input setValue={setFilterValue} value={filterValue} />
                <InputDescription>{`Number of Games >`}</InputDescription>
                <Input width='60px' setValue={setGamesGreater} value={gamesGreater} defaultValue={0} type='number' maxLength={8} />
            </InputSection>
            {sortedFilteredData}
        </MainContainer>
        <AdBlock />
    </Flex>
}

export default WinRates
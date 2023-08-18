import { useContext, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import ChampionSelect, { CallbackData } from './ChampionSelect'
import { JSX } from 'react/jsx-runtime'
import Context from '../Context/Context'
import Modal from './Modal'
import { getColorForPercentage } from '../Utils/utils'

const Container = styled.div`
    margin-top: auto;
    margin-bottom: auto;
    display: flex;
    margin-left: -65px;
    margin-right: -65px;
`

const Column = styled.div`
    margin: auto;
`

const HeaderBlock = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    overflow: hidden;
    position: relative;
    margin-top: 10px;
    margin-left: 20px;
    margin-right: 20px;
`

const RedHeader = styled.div`
    color: red;
    font-size: x-large;
    white-space: nowrap;
    overflow: hidden;
    margin: 10px;
`

const BlueHeader = styled.div`
    color: blue;
    font-size: x-large;
    white-space: nowrap;
    overflow: hidden;
    margin: 10px;
`

const ResultsView = styled.div`
    display: block;
    margin-top: -100px;
`

const CenterText = styled.div`
    text-align: center;
`
const Results = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
    overflow: hidden;
    position: relative;
    margin-top: 10px;
    margin-left: 20px;
    margin-right: 20px;
`
const ResultsTable = styled.table`
    width: max-content;
    border-collapse: collapse;
    min-width: 100%;
`
const ResultsRow = styled.tr`
    border-collapse: collapse;
    height: 27px;
`
const ResultsData = styled.td`
    border-collapse: collapse;
`

const CenterFlex = styled.div`
  display: flex;
  align-items: center;
`

interface Props {
    championWinRates: any
    pickedChamps: string[]
    setPickedChamps: (pc: string[]) => void
}



const CompBuilder = ({championWinRates, pickedChamps, setPickedChamps}: Props) => {
    const data = useContext(Context)

    interface winLoss {
        wins: number,
        losses: number
    }

    const defaultObject = { championPosition: '', matchupData: null }

    const [redSynergyAverage, setRedSynergyAverage] = useState(NaN)
    const [blueSynergyAverage, setBlueSynergyAverage] = useState(NaN)
    const [redMatchupAverage, setRedMatchupAverage] = useState(NaN)
    const [blueMatchupAverage, setBlueMatchupAverage] = useState(NaN)
    const [redData, setRedData] = useState<CallbackData[]>(Array(5).fill(defaultObject))
    const [blueData, setBlueData] = useState<CallbackData[]>(Array(5).fill(defaultObject))
    const [redCustomChamps, setRedCustomChamps] = useState<(string | null)[]>(Array(5).fill(null))
    const [blueCustomChamps, setBlueCustomChamps] = useState<(string | null)[]>(Array(5).fill(null))
    const [currentCustomChamp, setCurrentCustomChamp] = useState<{ redOrBlue: string, index: number }>({ redOrBlue: '', index: -1 })
    const [bestChampionMap, setBestChampionMap] = useState(new Map<string, any>())
    const [showConfusedModal, setShowConfusedModal] = useState(false)
    const [modalData, setModalData] = useState<any[]>([])
    const [recommendedChampionsTitle, setRecommendedChampionsTitle] = useState<string>('')

    const structureRedData = (data: CallbackData, index: number) => {
        let copy = [...redData]
        copy[index] = data
        setRedData(copy)
    }

    const structureBlueData = (data: CallbackData, index: number) => {
        let copy = [...blueData]
        copy[index] = data
        setBlueData(copy)
    }

    const findBestChampions = (color: string, position: string) => {
        setCurrentCustomChamp({ redOrBlue: color, index: getIndexGivenPosition(position) })
        const currentChamp = getCurrentlySelectedChampion(color, position)
        setBestChampionMap(new Map())//clear the data
        setRecommendedChampionsTitle(`Recommended Champions For ${capitalizeFirstLetter(color)} ${capitalizeFirstLetter(position === 'ADC' ? position : position.toLowerCase())}`)
        const teamData = color === 'red' ? redData : blueData
        const opponentData = color === 'red' ? blueData : redData
        teamData.forEach((data: CallbackData) => {
            if (!data.championPosition.includes(position) && data.championPosition !== '') {
                Object.entries(data.matchupData).forEach(([key, value]) => {
                    if (key.includes(`TEAM_${position}`)) {
                        const split = key.split('_')
                        const champName = split[split.length - 1]
                        if (!bestChampionMap.has(champName)) {
                            const wins = (value as any).wins
                            const losses = (value as any).losses
                            const val: winLossCountPercentage = { wins: wins, losses: losses, count: 1, summedPercent: percentage(wins, losses) }
                            bestChampionMap.set(champName, val)
                        }
                        else {
                            let newVal: winLossCountPercentage = bestChampionMap.get(champName)
                            const wins = (value as any).wins
                            const losses = (value as any).losses
                            newVal.wins += wins
                            newVal.losses += losses
                            newVal.count = newVal.count + 1
                            newVal.summedPercent = newVal.summedPercent + percentage(wins, losses)
                            bestChampionMap.set(champName, newVal)
                        }
                    }
                })
            }
        })

        opponentData.forEach((data: CallbackData) => {
            if (data.championPosition !== '') {
                Object.entries(data.matchupData).forEach(([key, value]) => {
                    if (key.includes(`OPPONENT_${position}`)) {
                        const split = key.split('_')
                        const champName = split[split.length - 1]
                        if (!bestChampionMap.has(champName)) {
                            const wins = (value as any).losses
                            const losses = (value as any).wins
                            let newVal: winLossCountPercentage = { wins: wins, losses: losses, count: 1, summedPercent: percentage(wins, losses) }
                            bestChampionMap.set(champName, newVal)
                        }
                        else {
                            let newVal: winLossCountPercentage = bestChampionMap.get(champName)
                            const wins = (value as any).losses
                            const losses = (value as any).wins
                            newVal.wins += wins
                            newVal.losses += losses
                            newVal.count = newVal.count + 1
                            newVal.summedPercent = newVal.summedPercent + percentage(wins, losses)
                            bestChampionMap.set(champName, newVal)
                        }
                    }
                })
            }
        })
        const dataToSort = []
        for (const entry of Array.from(bestChampionMap.entries())) {
            const key = entry[0]
            let newVal: winLossCountPercentage = bestChampionMap.get(key)
            const results = championWinRates[position].find((res: { key: string }) => res.key === key)
            // newVal.wins += results.wins
            // newVal.losses += results.losses
            newVal.count = newVal.count + 1
            newVal.summedPercent = newVal.summedPercent + results.pct
            bestChampionMap.set(key, newVal)
        }
        for (const entry of Array.from(bestChampionMap.entries())) {
            const key = entry[0];
            const value = entry[1];
            const totalGames = value.wins + value.losses
            //console.log('currentChamp', currentChamp)
            if (totalGames > getCutoff(currentChamp) && (!pickedChamps.includes(key) || key === currentChamp)) {
                dataToSort.push({ id: key, totalGames: totalGames, winPercent: value.summedPercent / value.count })
            }
        }
        dataToSort.sort((a, b) => { return b.winPercent - a.winPercent })
        if (dataToSort.length === 0) {
            // console.log('default positions')
            setModalData(getDefaultSuggestions(position, currentChamp))
        }
        else {
            setModalData(dataToSort)
        }
        setShowConfusedModal(true)
    }

    const clearRedCustomChamp = (index: number) => {
        redCustomChamps[index] = null
        setRedCustomChamps([...redCustomChamps])
    }

    const clearBlueCustomChamp = (index: number) => {
        blueCustomChamps[index] = null
        setBlueCustomChamps([...blueCustomChamps])
    }

    const getSynergyWinPercentage = (data: any, subData: any) => {
        const lookup = data.matchupData["TEAM_" + subData.championPosition]
        const wins = lookup?.wins
        const losses = lookup?.losses
        if (lookup) {
            const winPct = wins / (wins + losses)
            return [((winPct) * 100).toFixed(2) + "%", getColorForPercentage(winPct)]
        }
        return ["?", getColorForPercentage(0)]
    }

    const getSynergyDataPositionAndName = (position: string, champion: string, id: string, laneChampId: string) => {
        return <CenterFlex>{id !== laneChampId && <CenterFlex><img src={data.championToImage.get(laneChampId).src} style={{ width: "25px" }} />+</CenterFlex>}<img src={data.championToImage.get(id).src} style={{ width: "25px", marginLeft: id === laneChampId ? "18px" : '' }} /></CenterFlex>
    }

    const getSynergyWinRatio = (data: any, subData: any) => {
        const lookup = data.matchupData["TEAM_" + subData.championPosition]
        const wins = lookup?.wins
        const losses = lookup?.losses
        if (lookup) {
            return wins + "/" + (wins + losses)
        }
        return "0/0"
    }

    const getSynergyJsx = (redOrBlueData: CallbackData[], dataType: string) => {
        return redOrBlueData.map((data, index) => {
            if (data.championPosition === '') {
                return <Results key={index} />
            }
            return <Results key={index}>
                <ResultsTable>
                    <tbody>
                        {
                            redOrBlueData.map((sub, index) => {
                                if (sub.championPosition === '') {
                                    return <ResultsRow key={index}>
                                        <ResultsData />
                                        <ResultsData />
                                        <ResultsData />
                                    </ResultsRow>
                                }
                                const winPct = getSynergyWinPercentage(data, sub)
                                return <ResultsRow key={index}>
                                    <ResultsData>
                                        {getSynergyDataPositionAndName(sub.championPosition.split('_')[0], sub.championName, sub.championPosition.split('_')[1], data.championPosition.split('_')[1])}
                                    </ResultsData>
                                    <ResultsData style={{ textAlign: "center" }}>
                                        {getSynergyWinRatio(data, sub)}
                                    </ResultsData>
                                    <ResultsData id={`${dataType}${data.championPosition.split('_')[0]}SynergyResultPercent${index}`} style={{ color: winPct[1], textAlign: "right" }}>
                                        {winPct[0]}
                                    </ResultsData>
                                </ResultsRow>
                            })
                        }
                    </tbody>
                </ResultsTable>
            </Results>
        })
    }

    const getMatchupWinPercentage = (redOrBlueData: CallbackData, opponentChampionPosition: string) => {
        const data = redOrBlueData.matchupData[opponentChampionPosition]
        if (data) {
            const pct = data.wins / (data.wins + data.losses)
            return [((pct) * 100).toFixed(2) + "%", getColorForPercentage(data.wins / (data.wins + data.losses))]
        }
        return ["?", getColorForPercentage(0)]
    }

    const getChampionVersusChampionInPosition = (teamChampionName: string, teamChampionPosition: string, teamChampionId: string, opponentChampionName: string, opponentChampionPosition: string, opponentChampionId: string) => {
        return <CenterFlex><img src={data.championToImage.get(teamChampionId).src} style={{ width: "25px" }} /> vs <img src={data.championToImage.get(opponentChampionId).src} style={{ width: "25px" }} /></CenterFlex>
    }

    const getMatchupWinRatio = (redOrBlueData: CallbackData, opponentChampionPosition: string) => {
        const data = redOrBlueData.matchupData[opponentChampionPosition]
        if (data) {
            return data.wins + "/" + (data.wins + data.losses)
        }
        return "0/0"
    }

    const getMatchupJsx = (redOrBlueData: CallbackData[], otherTeamData: CallbackData[], dataType: string) => {
        return redOrBlueData.map((data, index) => {
            if (data.championPosition === '') {
                return <Results key={index} />
            }
            return <Results key={index}>
                <ResultsTable>
                    <tbody>
                        {
                            otherTeamData.map((other, index) => {
                                if (other.championPosition === '') {
                                    return <ResultsRow key={index}>
                                        <ResultsData />
                                        <ResultsData />
                                        <ResultsData />
                                    </ResultsRow>
                                }
                                const winPct = getMatchupWinPercentage(data, "OPPONENT_" + other.championPosition)
                                return <ResultsRow key={index}>
                                    <ResultsData>
                                        {getChampionVersusChampionInPosition(data.championName, data.championPosition.split('_')[0], data.championPosition.split('_')[1], other.championName, other.championPosition.split('_')[0], other.championPosition.split('_')[1])}
                                    </ResultsData>
                                    <ResultsData style={{ textAlign: "center" }}>
                                        {getMatchupWinRatio(data, "OPPONENT_" + other.championPosition)}
                                    </ResultsData>
                                    <ResultsData id={`${dataType}${data.championPosition.split('_')[0]}MatchupResultPercent${index}`} style={{ color: winPct[1], textAlign: "right" }}>
                                        {winPct[0]}
                                    </ResultsData>
                                </ResultsRow>
                            })
                        }
                    </tbody>
                </ResultsTable>
            </Results>
        })
    }

    const redMatchup = useMemo(() => {
        return getMatchupJsx(redData, blueData, 'red')
    }, [redData, blueData])

    const blueMatchup = useMemo(() => {
        return getMatchupJsx(blueData, redData, 'blue')
    }, [blueData, redData])

    const redSynergy = useMemo(() => {
        return getSynergyJsx(redData, 'red')
    }, [redData])

    const blueSynergy = useMemo(() => {
        return getSynergyJsx(blueData, 'blue')
    }, [blueData])

    useEffect(() => {
        let total = 0
        let count = 0
        const positionsToAverage = [
            'redTOPSynergyResultPercent0',
            'redTOPSynergyResultPercent1',
            'redTOPSynergyResultPercent2',
            'redTOPSynergyResultPercent3',
            'redTOPSynergyResultPercent4',
            'redJUNGLESynergyResultPercent1',
            'redJUNGLESynergyResultPercent2',
            'redJUNGLESynergyResultPercent3',
            'redJUNGLESynergyResultPercent4',
            'redMIDSynergyResultPercent2',
            'redMIDSynergyResultPercent3',
            'redMIDSynergyResultPercent4',
            'redADCSynergyResultPercent3',
            'redADCSynergyResultPercent4',
            'redSUPPORTSynergyResultPercent4'
        ]
        for (let id of positionsToAverage) {
            const innerText = document.getElementById(id)?.innerText
            if (innerText && innerText !== '') {
                total += innerText === '?' ? 0 : parseFloat(innerText?.replace(/%/g, '')!)
                count++
            }
        }
        setRedSynergyAverage(total / count)
    }, [redSynergy])

    useEffect(() => {
        let total = 0
        let count = 0
        const positionsToAverage = [
            'blueTOPSynergyResultPercent0',
            'blueTOPSynergyResultPercent1',
            'blueTOPSynergyResultPercent2',
            'blueTOPSynergyResultPercent3',
            'blueTOPSynergyResultPercent4',
            'blueJUNGLESynergyResultPercent1',
            'blueJUNGLESynergyResultPercent2',
            'blueJUNGLESynergyResultPercent3',
            'blueJUNGLESynergyResultPercent4',
            'blueMIDSynergyResultPercent2',
            'blueMIDSynergyResultPercent3',
            'blueMIDSynergyResultPercent4',
            'blueADCSynergyResultPercent3',
            'blueADCSynergyResultPercent4',
            'blueSUPPORTSynergyResultPercent4'
        ]
        for (let id of positionsToAverage) {
            const innerText = document.getElementById(id)?.innerText
            if (innerText && innerText !== '') {
                total += innerText === '?' ? 0 : parseFloat(innerText?.replace(/%/g, '')!)
                count++
            }
        }
        setBlueSynergyAverage(total / count)
    }, [blueSynergy])

    useEffect(() => {
        let total = 0
        let count = 0
        for (let position of ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"]) {
            for (let i = 0; i < 5; i++) {
                const innerText = document.getElementById(`red${position}MatchupResultPercent${i}`)?.innerText
                if (innerText && innerText !== '' && innerText !== '?') {
                    total += parseFloat(innerText?.replace(/%/g, '')!)
                    count++
                }
            }
        }
        setRedMatchupAverage(total / count)
    }, [redMatchup])

    useEffect(() => {
        let total = 0
        let count = 0
        for (let position of ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"]) {
            for (let i = 0; i < 5; i++) {
                const innerText = document.getElementById(`blue${position}MatchupResultPercent${i}`)?.innerText
                if (innerText && innerText !== '' && innerText !== '?') {
                    total += parseFloat(innerText?.replace(/%/g, '')!)
                    count++
                }
            }
        }
        setBlueMatchupAverage(total / count)
    }, [blueMatchup])

    const setPickedChamp = (champ: string, index: number) => {
        pickedChamps[index] = champ
        setPickedChamps([...pickedChamps])
    }

    const modalJsx = useMemo(() => {
        let group: JSX.Element[] = []
        return modalData.map((md, index) => {
            if (group.length === 4) {
                group = []
            }
            group.push(<div key={index} style={{ marginLeft: "3px", position: "relative" }} onClick={() => {
                if (currentCustomChamp.redOrBlue === 'red') {
                    redCustomChamps[currentCustomChamp.index] = md.id
                    setRedCustomChamps([...redCustomChamps])
                }
                else {
                    blueCustomChamps[currentCustomChamp.index] = md.id
                    setBlueCustomChamps([...blueCustomChamps])
                }
                setShowConfusedModal(false)
            }}>
                <img src={data.championToImage.get(md.id).src} style={{ cursor: "pointer" }}/>
                <div style={{ position: "absolute", zIndex: "100", bottom: "5px", color: getColorForPercentage(md.winPercent), userSelect: "none", backgroundColor: "black" }} key={index}>{(md.winPercent * 100).toFixed(2) + "%"}</div>
                <div style={{ position: "absolute", userSelect: "none", zIndex: "100", top: "0px", backgroundColor: "rgba(125, 125, 125, 0.5)"}}>{data.champData.find((data) => data.value === md.id)?.label}</div>
            </div>)
            if (group.length === 4 || index === modalData.length - 1) {
                return <div style={{ display: "flex", marginLeft: "8px" }} key={index}>
                    {group.map((data, index) => {
                        return <div key={index}>{data}</div>
                    })}
                </div>
            }
        })
    }, [modalData])

    const getCurrentlySelectedChampion = (color: string, position: string) => {
        let index = getIndexGivenPosition(position)
        if (color === 'blue') {
            index += 5
        }
        return pickedChamps[index]
    }

    const getDefaultSuggestions = (position: string, currentChamp: string) => {
        let ret: { id: string; totalGames: number; winPercent: number }[] = []
        championWinRates[position].forEach((data: { key: string; wins: number; losses: number; pct: number }) => {
            const totalGames = data.wins + data.losses
            if (totalGames >= 3000 && (!pickedChamps.includes(data.key) || data.key === currentChamp)) {
                ret.push({ id: data.key, totalGames: totalGames, winPercent: data.pct })
            }
        })
        return ret
    }

    const getCutoff = (currentChampion: string) => {
        //debugger
        let count = 0
        redData.forEach((rd) => {
            if (rd.championPosition !== '' && rd.championPosition.split('_')[1] !== currentChampion) {
                count++
            }
        })
        blueData.forEach((bd) => {
            if (bd.championPosition !== '' && bd.championPosition.split('_')[1] !== currentChampion) {
                count++
            }
        })
        //return (count === 0 ? 1 : count - 1) * 50
        return count * 75
    }

    const capitalizeFirstLetter = (word: string) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    const percentage = (wins: number, losses: number) => {
        return wins / (wins + losses)
      }
    
      type winLossCountPercentage = {
        wins: number,
        losses: number,
        count: number,
        summedPercent: number
      }
    
      const getIndexGivenPosition = (position: string) => {
        if (position === 'TOP') {
          return 0
        }
        else if (position === 'JUNGLE') {
          return 1
        }
        else if (position === 'MID') {
          return 2
        }
        else if (position === 'ADC') {
          return 3
        }
        else {
          return 4
        }
      }

    return (< div style={{ position: "relative", width: "max-content", margin: "auto", scale: "75%", marginTop: "-100px", marginBottom: "-100px" }
    } id="compbuilder" >
        <Modal isOpen={showConfusedModal} onClose={() => setShowConfusedModal(false)} title={recommendedChampionsTitle}>
            {modalJsx as any}
        </Modal>
        <Container>
            <Column>
                <HeaderBlock />
                <ChampionSelect selectedChampion={redCustomChamps[0]} clearSelectedChampion={() => clearRedCustomChamp(0)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 0) }} color='red' position='TOP' dataCallback={(data: CallbackData) => { structureRedData(data, 0) }} bestChampionCallback={findBestChampions} />
                <ChampionSelect selectedChampion={redCustomChamps[1]} clearSelectedChampion={() => clearRedCustomChamp(1)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 1) }} color='red' position='JUNGLE' dataCallback={(data: CallbackData) => { structureRedData(data, 1) }} bestChampionCallback={findBestChampions} />
                <ChampionSelect selectedChampion={redCustomChamps[2]} clearSelectedChampion={() => clearRedCustomChamp(2)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 2) }} color='red' position='MID' dataCallback={(data: CallbackData) => { structureRedData(data, 2) }} bestChampionCallback={findBestChampions} />
                <ChampionSelect selectedChampion={redCustomChamps[3]} clearSelectedChampion={() => clearRedCustomChamp(3)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 3) }} color='red' position='ADC' dataCallback={(data: CallbackData) => { structureRedData(data, 3) }} bestChampionCallback={findBestChampions} />
                <ChampionSelect selectedChampion={redCustomChamps[4]} clearSelectedChampion={() => clearRedCustomChamp(4)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 4) }} color='red' position='SUPPORT' dataCallback={(data: CallbackData) => { structureRedData(data, 4) }} bestChampionCallback={findBestChampions} />
                <Results />
            </Column>
            <Column>
                <HeaderBlock><RedHeader>Synergy</RedHeader></HeaderBlock>
                {redSynergy}
                <Results>
                    <ResultsView>
                        <RedHeader>
                            Average Synergy
                        </RedHeader>
                        <CenterText style={{ color: getColorForPercentage(redSynergyAverage / 100), height: "22px" }}>
                            {isNaN(redSynergyAverage) ? '' : redSynergyAverage.toFixed(2) + "%"}
                        </CenterText>
                    </ResultsView>
                </Results>
            </Column>
            <Column>
                <HeaderBlock><RedHeader>Matchup</RedHeader></HeaderBlock>
                {redMatchup}
                <Results>
                    <ResultsView>
                        <RedHeader>
                            Average Matchup
                        </RedHeader>
                        <CenterText style={{ color: getColorForPercentage(redMatchupAverage / 100), height: "22px" }}>
                            {isNaN(redMatchupAverage) ? '' : redMatchupAverage.toFixed(2) + "%"}
                        </CenterText>
                    </ResultsView>
                </Results>
            </Column>
            <Column>
                <HeaderBlock><BlueHeader>Matchup</BlueHeader></HeaderBlock>
                {blueMatchup}
                <Results>
                    <ResultsView>
                        <BlueHeader>
                            Average Matchup
                        </BlueHeader>
                        <CenterText style={{ color: getColorForPercentage(blueMatchupAverage / 100), height: "22px" }}>
                            {isNaN(blueMatchupAverage) ? '' : blueMatchupAverage.toFixed(2) + "%"}
                        </CenterText>
                    </ResultsView>
                </Results>
            </Column>
            <Column>
                <HeaderBlock><BlueHeader>Synergy</BlueHeader></HeaderBlock>
                {blueSynergy}
                <Results>
                    <ResultsView>
                        <BlueHeader>
                            Average Synergy
                        </BlueHeader>
                        <CenterText style={{ color: getColorForPercentage(blueSynergyAverage / 100), height: "22px" }}>
                            {isNaN(blueSynergyAverage) ? '' : blueSynergyAverage.toFixed(2) + "%"}
                        </CenterText>
                    </ResultsView>
                </Results>
            </Column>
            <Column>
                <HeaderBlock />
                <ChampionSelect selectedChampion={blueCustomChamps[0]} clearSelectedChampion={() => clearBlueCustomChamp(0)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 5) }} color='blue' position='TOP' dataCallback={(data: CallbackData) => { structureBlueData(data, 0) }} bestChampionCallback={findBestChampions} />
                <ChampionSelect selectedChampion={blueCustomChamps[1]} clearSelectedChampion={() => clearBlueCustomChamp(1)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 6) }} color='blue' position='JUNGLE' dataCallback={(data: CallbackData) => { structureBlueData(data, 1) }} bestChampionCallback={findBestChampions} />
                <ChampionSelect selectedChampion={blueCustomChamps[2]} clearSelectedChampion={() => clearBlueCustomChamp(2)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 7) }} color='blue' position='MID' dataCallback={(data: CallbackData) => { structureBlueData(data, 2) }} bestChampionCallback={findBestChampions} />
                <ChampionSelect selectedChampion={blueCustomChamps[3]} clearSelectedChampion={() => clearBlueCustomChamp(3)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 8) }} color='blue' position='ADC' dataCallback={(data: CallbackData) => { structureBlueData(data, 3) }} bestChampionCallback={findBestChampions} />
                <ChampionSelect selectedChampion={blueCustomChamps[4]} clearSelectedChampion={() => clearBlueCustomChamp(4)} setPickedChamp={(champ: string) => { setPickedChamp(champ, 9) }} color='blue' position='SUPPORT' dataCallback={(data: CallbackData) => { structureBlueData(data, 4) }} bestChampionCallback={findBestChampions} />
                <Results />
            </Column>
        </Container>
        <div style={{ display: "flex", position: "absolute", left: "30%" }}>
            <ResultsView>
                <RedHeader>
                    Combined Results
                </RedHeader>
                <CenterText style={{ color: getColorForPercentage((redSynergyAverage + redMatchupAverage) / 200) }}>
                    {!isNaN(redSynergyAverage) && !isNaN(redMatchupAverage) ? ((redSynergyAverage + redMatchupAverage) / 2).toFixed(2) + "%" : ''}
                </CenterText>
            </ResultsView>
        </div>
        <div style={{ display: "flex", position: "absolute", right: "30%" }}>
            <ResultsView>
                <BlueHeader>
                    Combined Results
                </BlueHeader>
                <CenterText style={{ color: getColorForPercentage((blueSynergyAverage + blueMatchupAverage) / 200) }}>
                    {!isNaN(blueSynergyAverage) && !isNaN(blueMatchupAverage) ? ((blueSynergyAverage + blueMatchupAverage) / 2).toFixed(2) + "%" : ''}
                </CenterText>
            </ResultsView>
        </div>
    </div >)
}

export default CompBuilder
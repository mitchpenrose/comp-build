import React, { ReactElement, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import ChampionSelect, { CallbackData } from './Components/ChampionSelect'
import styled, { createGlobalStyle } from 'styled-components'
import { getChampion, getWinrates } from './Services/services'
import Context, { ChampionSelection, Data } from './Context/Context'
// import Modal from 'react-modal'
import { ReactComponent as Logo } from './icons/logo.svg'
import { JSX } from 'react/jsx-runtime'
import Modal from './Components/Modal'

// Modal.setAppElement('#root')

const Container = styled.div`
    margin-top: auto;
    margin-bottom: auto;
    display: flex;
`

const Column = styled.div`
    margin: auto;
`
const GlobalStyle = createGlobalStyle`
    body {
      margin: 0;
      padding: 0;
      background: #1e2024;
      color: #808080;
    }
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

const CenterFlex = styled.div`
  display: flex;
  align-items: center;
`

const Header = styled.div`
  background-color: #191b1e;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-width: 1718px;
  //width: ${window.outerWidth}px;
`

const Footer = styled.div`
  background-color: #191b1e;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 1718px;
  // position: absolute;
  // height: 80px;
  // bottom: 0px;
`

const PatchInfo = styled.div`
  position: absolute;
  margin-left: 100%;
  margin-right: 10%;
  width: max-content;
`

const SubButton = styled.div`
  margin: 20px;
  margin-left: 50px;
  margin-right: 50px;
  cursor: pointer;
`

function App() {
  interface winLoss {
    wins: number,
    losses: number
  }

  const defaultObject = { championPosition: '', matchupData: null }

  const [championSelections, setChampionSelections] = useState<{ value: string, label: string }[]>([])
  const [redData, setRedData] = useState<CallbackData[]>(Array(5).fill(defaultObject))
  const [blueData, setBlueData] = useState<CallbackData[]>(Array(5).fill(defaultObject))
  const [redCustomChamps, setRedCustomChamps] = useState<(string | null)[]>(Array(5).fill(null))
  const [blueCustomChamps, setBlueCustomChamps] = useState<(string | null)[]>(Array(5).fill(null))
  const [currentCustomChamp, setCurrentCustomChamp] = useState<{ redOrBlue: string, index: number }>({ redOrBlue: '', index: -1 })
  const [redSynergyAverage, setRedSynergyAverage] = useState(0)
  const [blueSynergyAverage, setBlueSynergyAverage] = useState(0)
  const [redMatchupAverage, setRedMatchupAverage] = useState(0)
  const [blueMatchupAverage, setBlueMatchupAverage] = useState(0)
  const [bestChampionMap, setBestChampionMap] = useState(new Map<string, any>())
  const [showConfusedModal, setShowConfusedModal] = useState(false)
  const [modalData, setModalData] = useState<any[]>([])
  const [championToImage, setChampionToImage] = useState(new Map<string, any>())
  const [pickedChamps, setPickedChamps] = useState<string[]>([])
  const [championWinRates, setChampionWinRates] = useState<any>({})
  const [recommendedChampionsTitle, setRecommendedChampionsTitle] = useState<string>('')
  // const [width, setWidth] = useState('100%')
  // const rootRef = useRef(null)
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false)
  const [infoModalTitle, setInfoModalTitle] = useState<string>('')
  const [infoModalContent, setInfoModalContent] = useState<string>('')


  const patch = '13.11.1'

  useEffect(() => {
    getWinrates().then((result) => {
      setChampionWinRates(result)
    })
    getChampion(patch).then((result) => {
      const data = result.data as Record<string, { id: string, name: string }>;
      setChampionSelections(Object.entries(data).map(([, value]) => { return { value: value.id, label: value.name } }))
    })
  }, [])

  useEffect(() => {
    const championToImage = new Map<string, any>()
    championSelections.forEach((champ) => {
      const img = new Image()
      //img.src = require(`./Images/${champ.value}.png`)//`http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champ.value}.png`
      img.src = `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champ.value}.png`
      championToImage.set(champ.value, img)
    })
    setChampionToImage(championToImage)
  }, [championSelections.length])

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
      console.log('default positions')
      setModalData(getDefaultSuggestions(position, currentChamp))
    }
    else {
      setModalData(dataToSort)
    }
    setShowConfusedModal(true)
  }


  const getColorForPercentage = (pct: number) => {
    const percentColors = [
      { pct: 0.45, color: { r: 0xff, g: 0x00, b: 0 } },
      { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
      { pct: .55, color: { r: 0x00, g: 0xff, b: 0 } }]

    for (var i = 1; i < percentColors.length - 1; i++) {
      if (pct < percentColors[i].pct) {
        break
      }
    }
    var lower = percentColors[i - 1]
    var upper = percentColors[i]
    var range = upper.pct - lower.pct
    var rangePct = (pct - lower.pct) / range
    var pctLower = 1 - rangePct
    var pctUpper = rangePct
    var color = {
      r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
      g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
      b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    }
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')'
  }

  const modalJsx = useMemo(() => {
    let group: JSX.Element[] = []
    return modalData.map((data, index) => {
      if (group.length === 4) {
        group = []
      }
      group.push(<div key={index} style={{ marginLeft: "3px", position: "relative" }}>
        <img src={championToImage.get(data.id).src} style={{ cursor: "pointer" }} onClick={() => {
          if (currentCustomChamp.redOrBlue === 'red') {
            redCustomChamps[currentCustomChamp.index] = data.id
            //debugger
            setRedCustomChamps([...redCustomChamps])
          }
          else {
            blueCustomChamps[currentCustomChamp.index] = data.id
            setBlueCustomChamps([...blueCustomChamps])
          }
          setShowConfusedModal(false)
        }} />
        <div style={{ position: "absolute", zIndex: "100", bottom: "5px", color: getColorForPercentage(data.winPercent), userSelect: "none" }} key={index}>{(data.winPercent * 100).toFixed(2) + "%"}</div>
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

  const getSynergyDataPositionAndName = (position: string, champion: string, id: string, laneChampId: string) => {
    return <CenterFlex>{id !== laneChampId && <CenterFlex><img src={championToImage.get(laneChampId).src} style={{ width: "25px" }} />+</CenterFlex>}<img src={championToImage.get(id).src} style={{ width: "25px", marginLeft: id === laneChampId ? "18px" : '' }} /></CenterFlex>
    //return champion + " " + position
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

  const getChampionVersusChampionInPosition = (teamChampionName: string, teamChampionPosition: string, teamChampionId: string, opponentChampionName: string, opponentChampionPosition: string, opponentChampionId: string) => {
    return <CenterFlex><img src={championToImage.get(teamChampionId).src} style={{ width: "25px" }} /> vs <img src={championToImage.get(opponentChampionId).src} style={{ width: "25px" }} /></CenterFlex>
  }

  const getMatchupWinRatio = (redOrBlueData: CallbackData, opponentChampionPosition: string) => {
    const data = redOrBlueData.matchupData[opponentChampionPosition]
    if (data) {
      return data.wins + "/" + (data.wins + data.losses)
    }
    return "0/0"
  }

  const getMatchupWinPercentage = (redOrBlueData: CallbackData, opponentChampionPosition: string) => {
    const data = redOrBlueData.matchupData[opponentChampionPosition]
    if (data) {
      const pct = data.wins / (data.wins + data.losses)
      return [((pct) * 100).toFixed(2) + "%", getColorForPercentage(data.wins / (data.wins + data.losses))]
    }
    return ["?", getColorForPercentage(0)]
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

  const redSynergy = useMemo(() => {
    return getSynergyJsx(redData, 'red')
  }, [redData])

  const blueSynergy = useMemo(() => {
    return getSynergyJsx(blueData, 'blue')
  }, [blueData])

  const redMatchup = useMemo(() => {
    return getMatchupJsx(redData, blueData, 'red')
  }, [redData, blueData])

  const blueMatchup = useMemo(() => {
    return getMatchupJsx(blueData, redData, 'blue')
  }, [blueData, redData])

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

  const setupInfoModal = (title: string) => {
    if (title === 'About') {
      setInfoModalContent(`Composition Builder is a dynamic tool created for League of Legends players to optimize team compositions, offering informed champion selections rooted in data from Platinum+ tier matches. It allows users to evaluate individual champions in different roles, comparing them against all other champions within their team or against opponents.

      On the right or left side of the champion selection interface, users can find two tables: the Synergy table and the Matchup table. The Synergy table presents win rate data for the chosen champion in relation to their team members, with each row representing a different role: top, jungle, mid, ADC, and support. The 'Average Synergy' reflects the mean win rate based on all these combinations.
      
      Conversely, the Matchup table analyzes how the selected champion fares against each opponent in their corresponding role, and the 'Average Matchup' offers a comprehensive view of the performance across all opponents.
      
      Both these averages are then combined to form a 'Combined Results' value, providing an overview of the team's composition performance. However, it's important to remember that these statistics are not definitive indicators of match outcomes, but rather insightful references to comprehend historical champion synergy and matchups.
      
      For users who are unsure of champion role efficiency, the '?' button is a tool that displays champions with historically high synergy and matchup win rates. These are ordered from highest to lowest, offering a ranking system for decision making.
      
      Finally, users can clear a selected champion by clicking the button left or right of the champion dropdown. This allows for quick adjustments and recalculations, ensuring users can experiment with various team compositions with ease.
      
      Composition Builder aims to enhance strategizing and planning, encouraging data-driven decisions to elevate gameplay.
      `)
    }
    if (title === 'Legal') {
      setInfoModalContent(`Composition Builder isn't endorsed by Riot Games and doesn't reflect the views 
      or opinions of Riot Games or anyone officially involved in producing or managing 
      Riot Games properties. Riot Games, and all associated properties are trademarks 
      or registered trademarks of Riot Games, Inc.`)
    }
    else if (title === 'Contact') {
      setInfoModalContent(`We'd love to hear from you! If you have any questions, suggestions, or business 
      opportunities to discuss, feel free to reach out at [email]. Our team is always here to help.`)
    }
    setInfoModalTitle(title)
    setShowInfoModal(true)
  }

  const clearRedCustomChamp = (index: number) => {
    redCustomChamps[index] = null
    setRedCustomChamps([...redCustomChamps])
  }

  const clearBlueCustomChamp = (index: number) => {
    blueCustomChamps[index] = null
    setBlueCustomChamps([...blueCustomChamps])
  }

  return (
    <Context.Provider value={{ champData: championSelections, patch: patch, selectedChampions: pickedChamps, championToImage: championToImage } as Data}>
      <div id='yoyo'>
        <GlobalStyle />
        <Modal isOpen={showInfoModal} onClose={() => { setShowInfoModal(false) }} title={infoModalTitle} height='fit-content'>
          <div>
            {infoModalContent}
          </div>
        </Modal>
        <Modal isOpen={showConfusedModal} onClose={() => setShowConfusedModal(false)} title={recommendedChampionsTitle}>
          {modalJsx as any}
        </Modal>
        <Header id='header'>
          <Logo />
          <PatchInfo>
            Patch {patch}
          </PatchInfo>
        </Header>
        <div style={{ position: "relative", width: "max-content", margin: "auto" }} id="main">
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
        </div>
        <Footer>
          <SubButton onClick={() => setupInfoModal('About')}>About</SubButton>
          <SubButton onClick={() => setupInfoModal('Contact')}>Contact</SubButton>
          <SubButton onClick={() => setupInfoModal('Legal')}>Legal</SubButton>
          {/* <SubButton>Donate</SubButton> */}
        </Footer>
      </div>
    </Context.Provider>
  );
}

export default App;

export const getChampion = (patch: string): Promise<any> => {
    return fetch(`http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(json => {
            return json;
        })
        .catch(function () {
            console.log("An error occurred while fetching the JSON data.");
        });
}

export const getData = (positionChampion: string): Promise<any> => {
    return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/data?id=${positionChampion}`)//http://localhost:5000
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(json => {
            return json;
        })
        .catch(function () {
            console.log("An error occurred while fetching the matchup data.");
        });
}

export const getWinrates = () => {
    return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/winrates`)//http://localhost:5000
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(json => {
        return json;
    })
    .catch(function () {
        console.log("An error occurred while fetching the winrate data.");
    });
}
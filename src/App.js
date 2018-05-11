import React, { Component } from 'react';
import 'reset-css';
import './App.css';
import queryString from 'query-string';

const defaultStyle = {
  color: '#FFF',
  fontFamily: 'Papyrus'
};

const counterStyle = {
  ...defaultStyle,
  width: '40%',
  display: 'inline-block',
  marginBottom: '20px',
  fontSize: '20px',
  lineHeight: '30px'
};

const spotifyMeUrl = 'https://api.spotify.com/v1/me';

class PlaylistCounter extends Component {
  render() {
    const playlists = this.props.playlists || 0;
    return (
      <div style={counterStyle}>
        <h2>{playlists.length} playlists
        </h2>
      </div>
    );
  }
}

class HoursCounter extends Component {
  render() {
    const totalDuration = this.props.playlists
      .reduce((songs, playlist) => songs.concat(playlist.songs), [])
      .reduce((totalDuration, song) => totalDuration + song.duration, 0)/1000/60;
    const isTooLow = totalDuration < 10;
    const hoursCounterStyle = {
      ...counterStyle,
      color: isTooLow ? 'red' : 'white',
      fontWeight: isTooLow ? 'bold' : 'normal'
    };
    return (
      <div style={hoursCounterStyle}>
        <h2>{Math.round(totalDuration)} hours</h2>
      </div>
    );
  }
}

class Filter extends Component {
  render() {
    return (
      <div style={defaultStyle}>
        <img src="./49116.svg" alt="magnifying glass" style={{
          width: '20px',
          marginRight: '5px'
          }}/>
        <input type="text"
          onKeyUp={event => this.props.onTextChange(event.target.value)}
          style={{
            ...defaultStyle,
            color: 'black',
            fontSize: '20px',
            padding: '10px'
          }}
        />
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    const {playlist, index} = this.props;
    const imageUrl = playlist.images[0].url;
    return (
      <div style={{
        ...defaultStyle,
        width: '24%',
        display: 'inline-block',
        padding: '10px',
        backgroundColor: index % 2 ? '#C0C0C0' : '#808080'
      }}>
        <img src={imageUrl} style={{width: '75px'}} alt={playlist.name} />
        <h3>{playlist.name}</h3>
        <ul style={{
          marginTop: '10px'
        }}>
          {playlist.songs.map(song => <li style={{
            paddingTop: '2px'
          }}>{song.name}</li>)}
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: undefined,
      playlists: undefined,
      filterString: ''
    }
  }
  componentDidMount() {
    const parsed = queryString.parse(window.location.search);
    const {access_token} = parsed;
    if (!access_token) return;

    fetch(spotifyMeUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      }
    })
    .then(response => response.json())
    .then(data => this.setState({ user: { name: data.display_name }}));

    fetch(`${spotifyMeUrl}/playlists`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      }
    })
    .then(response => response.json())
    .then(data => {
      const playlists = data.items;
      const fetchOfTracks = playlists.map(playlist => {
        const responsePromise = fetch(playlist.tracks.href, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          }
        });
        const dataPromise = responsePromise.then(response => response.json());
        return dataPromise;
      })
      return Promise.all(fetchOfTracks)
      .then(trackDatas => {
        trackDatas.forEach((trackData, i) => {
          playlists[i].trackDatas = trackData
        })
        return playlists;
      })
    })
    .then(playlists => {
      console.log('playlists:', playlists);
      this.setState({
        playlists: playlists.map(playlist => {
          return {
            name: playlist.name,
            images: playlist.images,
            songs: playlist.trackDatas.items.slice(0,3).map(song => {
              return {
                name: song.track.name,
                duration: song.track.duration_ms
              }
            })
          }
        })
      })
    });
  }
  render() {
    const user = this.state.user && this.state.user;
    const playlists = this.state.playlists && this.state.playlists;
    let filteredPlaylists = playlists
      ? playlists
          .filter(playlist => playlist.name.toLowerCase()
          .includes(this.state.filterString.toLowerCase()))
      : [];
    return (
      <div className="App">
        {user ? 
        <div>
          <h1 style={{
            ...defaultStyle,
            fontSize: '54px',
            marginTop: '5px'
          }}>
            {user.name}'s playlists
          </h1>
          <PlaylistCounter playlists={filteredPlaylists} />
          <HoursCounter playlists={filteredPlaylists} />
          <Filter onTextChange={text => this.setState({filterString: text})}/>
          {filteredPlaylists.map((playlist, index) =>
            <Playlist playlist={playlist} index={index} />)}
        </div> : <button onClick={() => {
          window.location = window.location.href.includes('localhost')
            ? 'http://localhost:8888/login'
            : 'https://spotify-playlist-juaning-be.herokuapp.com/login'
          }
        }
          style={{padding: '20px', fontSize: '50px', marginTop: '20px'}}>
            Sign in with Spotify
        </button>
        }
      </div>
    );
  }
}

export default App;

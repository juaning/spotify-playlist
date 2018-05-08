import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';

const defaultStyle = {
  color: '#FFF'
};

const spotifyMeUrl = 'https://api.spotify.com/v1/me';

class PlaylistCounter extends Component {
  render() {
    const playlists = this.props.playlists || 0;
    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
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
      .reduce((totalDuration, song) => totalDuration + song.duration, 0);
    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
        <h2>{Math.round(totalDuration/60/60)} hours</h2>
      </div>
    );
  }
}

class Filter extends Component {
  render() {
    return (
      <div style={defaultStyle}>
        <img />
        <input type="text" onKeyUp={event => this.props.onTextChange(event.target.value)}/>
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    const {playlist} = this.props;
    const imageUrl = playlist.images[0].url;
    return (
      <div style={{...defaultStyle, width: '25%', display: 'inline-block'}}>
        <img src={imageUrl} style={{width: '75px'}} alt={playlist.name} />
        <h3>{playlist.name}</h3>
        <ul>
          {playlist.songs.map(song => <li>{song.name}</li>)}
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
          <h1 style={{...defaultStyle, fontSize: '54px'}}>
            {user.name}'s playlists
          </h1>
          <PlaylistCounter playlists={filteredPlaylists} />
          <HoursCounter playlists={filteredPlaylists} />
          <Filter onTextChange={text => this.setState({filterString: text})}/>
          {filteredPlaylists.map(playlist => <Playlist playlist={playlist} />)}
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

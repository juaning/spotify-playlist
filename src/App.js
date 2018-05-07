import React, { Component } from 'react';
import './App.css';

const defaultStyle = {
  color: '#FFF'
};

const fakeServerData = {
  user: {
    name: 'Juaning',
    playlists: [
      {
        name: 'My favourites',
        songs: [
          { name: 'Beat it', duration: 1345 },
          { name: 'Cannelloni maccaronni', duration: 2140 },
          { name: 'Rosa helikopter', duration: 1749 }
        ],
      },
      {
        name: 'Discover weekly',
        songs: [
          { name: 'Beat it', duration: 1345 },
          { name: 'Cannelloni maccaronni', duration: 2140 },
          { name: 'Rosa helikopter', duration: 1749 }
        ]
      },
      {
        name: 'Another playlist - The best!',
        songs: [
          { name: 'Beat it', duration: 1345 },
          { name: 'Cannelloni maccaronni', duration: 2140 },
          { name: 'Rosa helikopter', duration: 1749 }
        ]
      },
      {
        name: 'Playlist - Yeah!',
        songs: [
          { name: 'Beat it', duration: 1345 },
          { name: 'Cannelloni maccaronni', duration: 2140 },
          { name: 'Rosa helikopter', duration: 1749 }
        ]
      },
    ],
  }
};

class PlaylistCounter extends Component {
  render() {
    const playlists = this.props.playlists || 0;
    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
        <h2>{playlists.length} playlists</h2>
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
        <input type="text" />
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    return (
      <div style={{...defaultStyle, width: '25%', display: 'inline-block'}}>
        <img />
        <h3>Playlist Name</h3>
        <ul>
          <li>Song 1</li>
          <li>Song 2</li>
          <li>Song 3</li>
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      serverData: {}
    }
  }
  componentDidMount() {
    setTimeout(() => this.setState({serverData: fakeServerData}), 500);

  }
  render() {
    const user = this.state.serverData.user && this.state.serverData.user;
    const playlists = user && user.playlists;
    return (
      <div className="App">
        {user ? 
        <div>
          <h1 style={{...defaultStyle, fontSize: '54px'}}>
            {user.name}'s playlists
          </h1>
          <PlaylistCounter playlists={playlists} />
          <HoursCounter playlists={playlists} />
          <Filter />
          <Playlist />
          <Playlist />
          <Playlist />
          <Playlist />
        </div> : <h1 style={defaultStyle}>Loading...</h1>
        }
      </div>
    );
  }
}

export default App;

// Constants
var baseOpacity = 0.5 // Should match opacity of .dimmer in style.css
var flashOpacity = 1
var flashTime = 400
var maxTurns = 5 // Assignment requires 20

var dom 

var Simon = function () {
  var ef = function () {} // Empty Function

  var currentState = null
  
  var colors = [
    {
      el: document.getElementsByClassName('red')[0],
      sound: new Audio('sounds/button1.mp3')
    },
    {
      el: document.getElementsByClassName('blue')[0],
      sound: new Audio('sounds/button2.mp3') 
    },
    {
      el: document.getElementsByClassName('green')[0],
      sound: new Audio('sounds/button3.mp3') 
    },
    {
      el: document.getElementsByClassName('yellow')[0],
      sound: new Audio('sounds/button4.mp3') 
    }
  ]

  function changeState (state) {
    if (currentState) currentState.exit()
    // console.log('Entering', state.name)
    currentState = state
    currentState.entry()
  }

  var turnCount = 0
  var pattern = []

  function getRandomColour () {
    var idx = Math.floor(Math.random() * 4)
    return colors[idx]
  }

  function changeTurnCount (type) {
    // type: 'reset', 'remove' or 'add'
    type = type.toLowerCase()
    switch (type) {
      case 'add':
        turnCount++
        break
      case 'remove':
        turnCount--
        break
      case 'reset':
        turnCount = 0
        break
      case 'none':
        break // Just using this function to update the DOM
      default:
        console.log(type + ' is not a turnCount operator.')
    }

    if (type !== 'reset') { // On reset, the dom will be flashing
        dom.countDisplay.innerText = ('0' + turnCount).slice(-2)
      }
  }

  function flashDisplay (symbol, cb) {
    // symbol will be flashed on the game screen.
    // Use 'X' for a defeat and '!' for victory.
    // The display will be left showing newVal if supplied, otherwise the previous value.

    var show = dom.countDisplay

    function flashOnce(count) {
      // Show the win or loss symbol followed by a blank.
      // This will only work in the context of the flashDisplay function.
      if (count < 1) {
        changeTurnCount('none')
        if (cb) cb()
      } else {
        show.innerText = [symbol, symbol].join('')
        setTimeout(() => {
          show.innerText = ''
          setTimeout(() => {
            flashOnce(count-1)
          }, flashTime)
        }, flashTime)
      }
    }

    flashOnce(2)
  }

  function newGame (win) {
    console.log(win ? 'Victory' : 'Defeat')
    pattern = []
    changeTurnCount('reset')
    flashDisplay(win ? '!' : 'X', () => {changeState(states.simonTurn)})
  }

  function flashPattern (cb, pat) {
    // Highlight the colours in order of the current pattern, if there is one
    tail = pat || pattern
    if (tail.length > 0) {
      flashButton(tail[0])
      setTimeout(() => {
        flashPattern(cb, tail.slice(1))
      }, flashTime * 1.5)
    } else {
      if (cb) cb()
    }
  }

  this.init = function () {
      changeState(states.simonTurn)
      colors.forEach((x) => {
        x.el.addEventListener('click', currentState.colourClick, false)
      })
  }

  var states = {
    playerTurn: function () {
      var playerPattern

      function patternCompare (pat1, pat2) {
        if (pat1.length !== pat2.length) {
          return false
        }

        return pat1.filter(function (item, idx) {
          return (item === pat2[idx])
        }).length === pat1.length
      }

      return {
        name: 'playerTurn',
        entry: function () {
          playerPattern = []
        },
        colourClick: function (evt) {
          flashButton(colors.filter((col) => {return (col.el === evt.target)})[0])
          playerPattern.push(evt.target)
          var pass = patternCompare(playerPattern, pattern.slice(0, playerPattern.length).map((col) => {return col.el}))
          if (!pass) {
            changeState(states.defeat)
          } else {
            if (playerPattern.length === pattern.length) {
              changeState(states.simonTurn)
            }
          }
        },
        click: ef,
        exit: ef
      }
    }(),
    simonTurn: {
      name: 'simonTurn',
      entry: function () {
        if (turnCount >= maxTurns) {
          changeState(states.victory)
        } else {
          changeTurnCount('add')
          pattern.push(getRandomColour())
          setTimeout(() => {
            flashPattern()
          }, flashTime * 2)
          changeState(states.playerTurn)
        }
      },
      click: ef,
      exit: ef,
      colourClick: ef
    },
    victory: {
      name: 'victory',
      entry: function () {
        newGame(true)
      },
      click: ef,
      exit: ef,
      colourClick: ef
    },
    defeat: function () {
      function isStrict() {
        return !dom.strictButton.classList.contains('dimmer')
      }

      return {
        name: 'defeat',
        entry: function () {
          if (isStrict()) {
            newGame(false)
          } else {
            flashDisplay ('X', () => {
              flashPattern (() => {
                changeState(states.playerTurn)
              })
            })
            // setTimeout(() => {
            //   flashPattern()
            // }, flashTime * 2)
            // changeState(states.playerTurn)
          }
        },
        exit: ef,
        colourClick: ef,
        click: ef
      }
    }()
  }
}

function flashButton (button, cb) {
  // el is a dom element that has opacity 0.5 as a base state.
  var el = button.el || button
  el.style.opacity = flashOpacity
  if (button.sound) button.sound.play()
  setTimeout(() => {
    el.style.opacity = baseOpacity
    if (cb) cb()
  }, flashTime)
}

function toggleClass(el, className) {
  if (el.classList.contains(className)) {
    el.classList.remove(className)
  } else {
    el.classList.add(className)
  }
}

function run () {
  dom = {
    startButton: document.getElementById('start-button'),
    strictButton: document.getElementById('strict-button'),
    countDisplay: document.getElementsByClassName('count')[0]
  }

  dom['startButton'].addEventListener('click', (evt) => {
    flashButton(dom['startButton'], () => {
      var game = new Simon()
      game.init()
    })
  })

  dom['strictButton'].addEventListener('click', (evt) => {
    toggleClass(evt.target, 'dimmer')
  })
}

// in case the document is already rendered
if (document.readyState !== 'loading') run()
// modern browsers
else if (document.addEventListener) document.addEventListener('DOMContentLoaded', run)
// IE <= 8
else document.attachEvent('onreadystatechange', function () {
  if (document.readyState === 'complete') run()
})


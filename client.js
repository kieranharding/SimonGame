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
    document.getElementsByClassName('red')[0],
    document.getElementsByClassName('blue')[0],
    document.getElementsByClassName('green')[0],
    document.getElementsByClassName('yellow')[0]
  ]

  function changeState (state) {
    if (currentState) currentState.exit()
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
      default:
        console.log(type + ' is not a turnCount operator.')
    }

    dom.countDisplay.innerText = turnCount
  }

  function flashPattern (pat) {
    // Highlight the colours in order of the current pattern, if there is one
    tail = pat || pattern
    if (tail.length > 0) {
      flashButton(tail[0])
      setTimeout(() => {
        flashPattern(tail.slice(1))
      }, flashTime + 100)
    } else {
      return
    }
  }

  this.init = function () {
      changeState(states.simonTurn)
      colors.forEach(function (x) {
        x.addEventListener('click', currentState.colourClick, false)
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
        entry: function () {
          playerPattern = []
        },
        colourClick: function (evt) {
          if (playerPattern.length < turnCount) {
            flashButton(evt.target)
            playerPattern.push(evt.target)
          }
          if (playerPattern.length === turnCount) {
            var pass = patternCompare(playerPattern, pattern)
            setTimeout(() => {
              if (pass) {
                changeState(states.simonTurn)
              } else {
                changeState(states.defeat) 
              }  
            }, flashTime + 250)
          }
        },
        click: ef,
        exit: ef
      }
    }(),
    simonTurn: {
      entry: function () {
        changeTurnCount('add')
        if (turnCount > maxTurns) {
          changeState(states.victory)
        }
        pattern.push(getRandomColour())
        flashPattern()
        changeState(states.playerTurn)
      },
      click: ef,
      exit: ef,
      colourClick: ef
    },
    victory: {
      entry: function () {
        console.log('victory')
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
        entry: function () {
          if (isStrict()) {
            // TODO: Animate transition to new game
            pattern = []
            changeTurnCount('reset')
            changeState(states.simonTurn)
          } else {
            flashPattern()
            changeState(states.playerTurn)
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
  // Button is a dom element that has opacity 0.5 as a base state.
  button.style.opacity = flashOpacity
  setTimeout(() => {
    button.style.opacity = baseOpacity
    // TODO: Play sound when flashing colours
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


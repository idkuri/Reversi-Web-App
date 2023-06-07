// Calculates the new state of the game given the current state and the move
function calculate(state, player, move) {

  // Conditions need to be met: 
  // 1) White vicinity
  // 2) Same piece in range 
  let array = state
  array[move[0]][move[1]] = player
  // Horizontal search
  const hResult = searchHorizontal(array, player, move)
  // console.log(`Horizontal Start: ${hResult[0]} End: ${hResult[1]}`)
  array = flipHorizontal(array, player, move[0], hResult[0], hResult[1]);


  // Implement Vertical
  const vResult = searchVertical(array, player, move)
  // console.log(`Vertical Start: ${vResult[0]} End: ${vResult[1]}`)
  array = flipVertical(array, player, move[1], vResult[0], vResult[1]);

  // Implement Diagonal
  const dResult = searchDiagonal(array, player, move)
  array = flipDiagonal(array, player, dResult[0], dResult[1]);

  return array;
}

function searchHorizontal(state, player, move) {
  let start = move[1]
  let end = move[1]

  for (let i = move[1]-1; i >= 0 ; i--) {
    if (state[move[0]][i] == 0) {
      break
    }
    if (state[move[0]][move[1]-1] == player) {
      break
    }
    if (state[move[0]][i] == player) {
      start = i
      break
    }
  }


  for (let i = move[1]+1; i < 8; i++) {
    if (state[move[0]][i] == 0) {
      break
    }
    if (state[move[0]][move[1]+1] == player) {
      break
    }
    if (state[move[0]][i] == player) {
      end = i
      break
    }
  }
  return [start, end]
}

function searchVertical(state, player, move) {
  let start = move[0]
  let end = move[0]
  for (let i = move[0]-1; i >= 0 ; i--) {
    if (state[i][move[1]] == 0) {
      break
    }
    if (state[move[0]-1][move[1]] == player) {
      break
    }
    if (state[i][move[1]] == player) {
      start = i
      break
    }
  }
  for (let i = move[0]+1; i < 8; i++) {
    if (state[i][move[1]] == 0) {
      break
    }
    if (state[move[0]+1][move[1]] == player) {
      break
    }
    if (state[i][move[1]] == player) {
      end = i
      break
    }
  }
  return [start, end]
}

function searchDiagonal(state, player, move) {
  // DR short hand for down right
  // TR short hand for top right
  let DRstart = move
  let DRend = move
  let TRstart = move
  let TRend = move

  // [negative \] < relative to the columns
  for (let i = move[0]-1, j = move[1]-1; i >= 0 && j >= 0  ; i--, j--) {
    if (state[i][j] == 0) {
      break
    }
    if (state[move[0]-1][move[1]-1] == player) {
      break
    }
    if (state[i][j] == player) {
      DRstart = [i, j]
      break
    }
  }
  // [positive \] < relative to the columns
  for (let i = move[0]+1, j = move[1]+1; i < 8 && j < 8; i++, j++) {
    if (state[i][j] == 0) {
      break
    }
    if (state[move[0]+1][move[1]+1] == player) {
      break
    }
    if (state[i][j] == player) {
      DRend = [i, j]
      break
    }
  }
  // // [positive /] < relative to the columns
  for (let i = move[0]-1, j = move[1]+1; i >= 0 && j < 8  ; i--, j++) {
    if (state[i][j] == 0) {
      break
    }
    if (state[move[0]-1][move[1]+1] == player) {
      break
    }
    if (state[i][j] == player) {
      TRend = [i, j]
      break
    }
  }
  // // [negative /] < relative to the columns
  for (let i = move[0]+1, j = move[1]-1; i < 8 && j >= 0  ; i++, j--) {
    if (state[i][j] == 0) {
      break
    }
    if (state[move[0]+1][move[1]-1] == player) {
      break
    }
    if (state[i][j] == player) {
      TRstart = [i, j]
      break
    }
  }
  return [[DRstart, DRend], [TRstart, TRend]]
}

function flipHorizontal(state, player, row, start, end) {
  let array = state
  for (let i = start; i <= end; i++ ) {
    array[row][i] = player
  }
  return array;
}

function flipVertical(state, player, column, start, end) {
  let array = state
  for (let i = start; i <= end; i++ ) {
    array[i][column] = player
  }
  return array;
}

function flipDiagonal(state, player, DR, TR) {
  const DRstart = DR[0]
  const DRend = DR[1]
  const TRstart = TR[0]
  const TRend = TR[1]

  let array = state
  for (let i = DRstart[0], j = DRstart[1]; i <= DRend[0] && j <= DRend[1]; i++, j++) {
    array[i][j] = player
  }
  for (let i = TRstart[0], j = TRstart[1]; i >= TRend[0] && j <= TRend[1]; i--, j++) {
    array[i][j] = player
  }
  return array;
}


function getValidMoves(state, player) {
  const validMoves = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((state[row][col] != 1 && state[row][col] != 2) && checkValidity(state, player, [row, col])) {
        validMoves.push([row, col]);
      }
    }
  }
  
  return validMoves;
}

function checkValidity(state, player, move) {
    const hResult = searchHorizontal(state, player, move)
    const vResult = searchVertical(state, player, move)
    const dResult = searchDiagonal(state, player, move)
    const cond1 = (hResult[0] === hResult[1])// true means no flip
    const cond2 = (vResult[0] === vResult[1]) // true means no flip
    const DRstart = dResult[0][0]
    const DRend = dResult[0][1]
    const TRstart = dResult[1][0]
    const TRend = dResult[1][1];
    const DReq = (DRstart[0] === DRend[0]) && (DRstart[1] === DRend[1])
    const TReq = (TRstart[0] === TRend[0]) && (TRstart[1] === TRend[1])
    const cond3 = DReq && TReq // true means no flip
    if (cond1 && cond2 && cond3) {{
      return false
    }}
  return true // return array of position that has
}

module.exports = {
  getValidMoves,
  checkValidity,
  calculate
};
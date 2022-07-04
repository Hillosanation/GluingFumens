const yargs = require('yargs')(process.argv.slice(2));
const { decoder, encoder} = require('tetris-fumen');
const fs = require('fs');

const argv = yargs
  .option({
    'fu': {
        alias: 'fumen',
        default: '',
        describe: 'The input to be glued. If multiple fumens are to be glued, then put them in a space-separated string.',
        type: 'string',
    },
    'fp': {
        alias: 'file-path',
        default: '',
        type: 'string',
        describe: 'File path for the whitespace-separated fumens. This overrides --fu.',
    },
    'op': {
        alias: 'output-path',
        default: '',
        type: 'string',
        describe: 'File path for the output file.'
    },
  })
  .check((argv, options) => {
    const filePaths = argv
    if ((filePaths.fu == '') && (filePaths.fp == '')) {
      throw new Error("Neither fp nor fu was provided.");
    } else {
      return true; // tell Yargs that the arguments passed the check
    }
  })
  .hide('version')
  .help()
  .alias('help', 'h').argv;

if (argv.fp != "") {
    const data = fs.readFileSync(argv.fp, "utf8");
    splitdata = data.split(/\s+/);
    // console.log(splitdata);
    argv.fu = splitdata.join(" ");
}

pieces = {
    T: [
        [[0, 0], [0, -1], [0, 1], [1, 0]],
        [[0, 0], [0, 1], [1, 0], [-1, 0]],
        [[0, 0], [0, -1], [0, 1], [-1, 0]],
        [[0, 0], [0, -1], [1, 0], [-1, 0]]
    ],
    I: [
        [[0, 0], [0, -1], [0, 1], [0, 2]],
        [[0, 0], [1, 0], [-1, 0], [-2, 0]],
        [[0, 0], [0, -1], [0, -2], [0, 1]],
        [[0, 0], [1, 0], [2, 0], [-1, 0]]
    ],
    L: [
        [[0, 0], [0, -1], [0, 1], [1, 1]],
        [[0, 0], [1, 0], [-1, 0], [-1, 1]],
        [[0, 0], [0, -1], [0, 1], [-1, -1]],
        [[0, 0], [1, -1], [1, 0], [-1, 0]]
    ],
    J: [
        [[0, 0], [0, -1], [0, 1], [1, -1]],
        [[0, 0], [1, 0], [-1, 0], [1, 1]],
        [[0, 0], [0, -1], [0, 1], [-1, 1]],
        [[0, 0], [-1, -1], [1, 0], [-1, 0]]
    ],
    S: [
        [[0, 0], [0, -1], [1, 0], [1, 1]],
        [[0, 0], [1, 0], [0, 1], [-1, 1]],
        [[0, 0], [0, 1], [-1, 0], [-1, -1]],
        [[0, 0], [-1, 0], [0, -1], [1, -1]]
    ],
    Z: [
        [[0, 0], [0, 1], [1, 0], [1, -1]],
        [[0, 0], [-1, 0], [0, 1], [1, 1]],
        [[0, 0], [0, -1], [-1, 0], [-1, 1]],
        [[0, 0], [1, 0], [0, -1], [-1, -1]]
    ],
    O: [
        [[0, 0], [1, 0], [0, 1], [1, 1]],
        [[0, 0], [0, 1], [-1, 0], [-1, 1]],
        [[0, 0], [-1, 0], [0, -1], [-1, -1]],
        [[0, 0], [0, -1], [1, -1], [1, 0]]
    ]
}

rotationMapping = {
    "spawn": 0,
    "right": 1,
    "reverse": 2,
    "left": 3
}

colorMapping = {
    "S": 7,
    "J": 6,
    "T": 5,
    "Z": 4,
    "O": 3,
    "L": 2,
    "I": 1
}

function clearedOffset(rowsCleared, yIndex) {
    for (let row of rowsCleared) {
        if (yIndex >= row) yIndex++;
    }
    return yIndex;
}

var fumenCodes = []
fumenCodes.push(...argv.fu.split(" "));

// console.log(fumenCodes);

Output = []
for (let code of fumenCodes) {
    if (code == "") continue;
    // console.log(code);
    let inputPages = decoder.decode(code);
    board = inputPages[0]["_field"]["field"]["pieces"]; 
    rowsCleared = [];

    for (let pageNum = 0; pageNum < inputPages.length; pageNum++) {
        op = inputPages[pageNum]["operation"];
        piece = pieces[op["type"]][rotationMapping[op["rotation"]]];

        for (let mino of piece) {
            yIndex = op.y + mino[0];
            yIndex = clearedOffset(rowsCleared, yIndex);
            xIndex = op.x + mino[1];
            index = yIndex * 10 + xIndex;
            if (board[index] != 0) { console.log("error"); } // some intersect with the board
            board[index] = colorMapping[op["type"]];
        }

        temp = [];

        for (let y = -2; y < 3; y++) { // rows in which the piece might have been
            yIndex = op.y + y;
            yIndex = clearedOffset(rowsCleared, yIndex);
            if (yIndex >= 0) { // sanity check
                rowCleared = true;
                for (let x = 0; x < 10; x++) {
                    index = yIndex * 10 + x;
                    rowCleared = rowCleared && (board[index] != 0);
                }
                if (rowCleared) {
                    temp.push(yIndex);
                }
            }
        }

        for (let row of temp) {
            if (!rowsCleared.includes(row)) {
                rowsCleared.push(row);
                rowsCleared.sort();
            }
        }
        
    }

    let outputPages = [inputPages[0]]; // lazily generating output fumen by destructively modifying the input
    outputPages[0]["operation"] = undefined;
    outputPages[0]["_field"]["field"]["pieces"] = board;
    
    Output.push(encoder.encode(outputPages));
}

if (argv.op != '') {
    fs.writeFile(argv.op, Output.join("\n"), (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully to " + argv.op + "\n");
    }
    });
} else {
    console.log(Output);
}
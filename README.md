# GluingFumens
Turning single page fumens with color coded pieces into multipage fumens with a piece on each page  

Supports multipage fumens and multiple fumen inputs  
Note: if there's multiple ways to cover the colored minos then all are outputed  
# Command
```node glueFumen.js --fu fumenCode(s) [--so true]```  

Do ```node glueFumen.js -h``` for detailed documentation of commands.

Example:  
```node glueFumen.js --fu "v115@9gA8ywg0glR4RpB8wwklRpD8i0glG8R4glB8JeAgH"```  
Would output  
```v115@9gA8IeB8HeD8DeG8CeB8JeFAJvhESmBTjB6sB2rBXs?B```  

# Dependencies  
```npm install hashmap``` - hashmap  
```npm install tetris-fumen``` - [fumen api](https://github.com/knewjade/tetris-fumen)   
```npm install yargs``` - parse arguments
/**
 * Реализация API, не изменяйте ее
 * @param {string} url
 * @param {function} callback
 */
function getData(url, callback) {
    var RESPONSES = {
        '/countries': [
            {name: 'Cameroon', continent: 'Africa'},
            {name :'Fiji Islands', continent: 'Oceania'},
            {name: 'Guatemala', continent: 'North America'},
            {name: 'Japan', continent: 'Asia'},
            {name: 'Yugoslavia', continent: 'Europe'},
            {name: 'Tanzania', continent: 'Africa'}
        ],
        '/cities': [
            {name: 'Bamenda', country: 'Cameroon'},
            {name: 'Suva', country: 'Fiji Islands'},
            {name: 'Quetzaltenango', country: 'Guatemala'},
            {name: 'Osaka', country: 'Japan'},
            {name: 'Subotica', country: 'Yugoslavia'},
            {name: 'Zanzibar', country: 'Tanzania'},
        ],
        '/populations': [
            {count: 138000, name: 'Bamenda'},
            {count: 77366, name: 'Suva'},
            {count: 90801, name: 'Quetzaltenango'},
            {count: 2595674, name: 'Osaka'},
            {count: 100386, name: 'Subotica'},
            {count: 157634, name: 'Zanzibar'}
        ]
    };

    setTimeout(function () {
        var result = RESPONSES[url];
        if (!result) {
            return callback('Unknown url');
        }

        callback(null, result);
    }, Math.round(Math.random * 1000));
}

/**
 * Ошибка возникает из-за того, что в реализации API функция callback выполняется асинхронно с задержкой, при этом 
 * указанная функция зависит от глобальной переменной, изменяемой во внешнем цикле for. В итоге получается, что 
 * к моменту фактической обработки вызовов функции callback цикл for уже отработал, и переменная request имеет
 * значение '/populations' для всех трёх вызовов callback. Чтобы избежать данной ошибки в будущем нужно с особой
 * осторожностью использовать зависимость функций от глобальных переменных, которые в свою очередь изменяются во внешних
 * циклах. Решить данную проблему можно многими разными способами, в частности удобно использовать замыкание.  
 */

(function(){
    
    var requests = ['/countries', '/cities', '/populations'];
    var responses = {};

    /**
     * Функция, которая возвращает массив значений ключа resultKey, соответствующие массиву array значений ключа requestKey
     * в полученном от API ответе на запрос request.
     */
    function filter(request, array, requestKey, resultKey){
        var filteredData = [];
        array.forEach(function(item){
            filterByArrayItem(request, item, requestKey).forEach(function(entry){
                filteredData.push(entry);
            });    
        });
        return filteredData.map(function(object){
            return object[resultKey];
        }); 
    }

    /**
    * Функция, которая возвращает полученный от API ответ, отфильтрованный по значению ключа requestKey, равного
    * значению arrayItem.
    */
    function filterByArrayItem(request, arrayItem, requestKey){
        return responses[request].filter(function(object){
            return object[requestKey].toUpperCase() === arrayItem.toUpperCase();
        });
    }

    /**
     * Функция, которая получает массив названий городов и возвращает их суммарное население.
     */
    function calculatePopulation(request, cities){
        var population=0;
        responses[request].forEach(function(object){
            cities.forEach(function (item){
                if(object.name.toUpperCase() === item.toUpperCase()){
                    population+=object.count;
                }
            });
        });
        return population;
    }

    /**
     * Применение замыкания. Функция получает значение request и возвращает ссылку на функцию callback. 
     */
    function returnCallback(request){
        function callback (error, result) {
        	//Добавлена обработка ошибки.
            if(error === null){
                responses[request] = result;
                var responsesProcessed = [];
                for (var urlRequest in responses){
                    responsesProcessed.push(urlRequest);
                }

                if (responsesProcessed.length == 3) {
                    var continent = ['Africa'];
                    var countries = filter('/countries', continent, 'continent', 'name');
                    var cities = filter('/cities', countries, 'country', 'name');
                    var population = calculatePopulation('/populations',cities);
                    console.log('Total population in African cities: ' + population);
                    //Добавлен вызов функции, реализующей диалог с пользователем. Функция запрашивает
                    //ввод названия страны или города и обрабатывает его до тех пор, пока не будет
                    //использована кнопка отмены.
                    while(processUserInput());
                }
            } else {
                console.log('Error: ' + error);
            }
        }
        return callback;
    }

    /**
     * Обработка диалога с пользователем.
     * 
     * Проверка введённого значения. Функция получает строку, введённую пользователем, и возвращает 'country',
     * если пользователь ввёл название одной из стран, 'name', если пользователь указал город, и null иначе.
     */
    function validateUserInput(userInput){
        for (var i = 0; i < responses['/cities'].length; i++) {
    		for(var property in responses['/cities'][i]){
    			if(responses['/cities'][i][property].toUpperCase() === userInput.toUpperCase()){
    				return property;
    			}
    		}
    	}  
        return null;
    }

    /**
     * Реализация диалога с помощью window.prompt.
     */
    function processUserInput(){
        var string ="Enter a country or a city to learn its population.\nAPI has information about \n";
        responses['/cities'].forEach(function(object,i){
            string+=object.name+", "+object.country;
            if(i<responses['/cities'].length-1){
                string+=";\n";
            }else{
                string+=".\nInput is case-insensitive."
            }
        });
        var userInput = prompt(string, 'Cameroon');
        if(userInput === null){
            return false;
        } else {
        	var validate = validateUserInput(userInput);
        	if(validate === 'country'){
        		var cities = filter('/cities', [userInput], 'country', 'name');
                var population = calculatePopulation('/populations',cities);
                return(confirm ('Population of '+ userInput + ' is ' + population + '. Do you want to try again?'));
        	} else if(validate === 'name'){
                var population = calculatePopulation('/populations',[userInput]);
               	return(confirm ('Population of '+ userInput + ' is ' + population + '. Do you want to try again?'));
        	} else {
        		return(confirm ('Sorry, we do not have the requered data or your input was incorrect. Do you want to try again?'));
        	}
        }
    }

    /**
     * Запросы к API.
     */   
    requests.forEach(function (request){
        getData(request, returnCallback(request));
    });
})();
//3 modules
var BudgetController=(function(){
    
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }
    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
    }
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }
    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
    
    
    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    }
    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(current){
            sum+=current.value;
        });
        data.totals[type]=sum;
    };
    return {
        addItem:function(type,des,val){
            var newItem,ID;
            
            //1.get next ID
            //[1 2 3 4] id-5
            //[1 2 5 8] id=9
            if(data.allItems[type].length >0){
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }else{
                ID=0;
            }
            
            console.log(ID);
            
            //2.create new item
            if(type==='exp'){
                newItem=new Expense(ID,des,val);
            }else if(type==='inc'){
                newItem=new Income(ID,des,val);
            }
            
            //3.push into DS
            data.allItems[type].push(newItem);
            
            //4.return newItem
            return newItem;
        },
        calculateBudget:function(){
            //1.calc total inc and exp
            calculateTotal('exp');
            calculateTotal('inc');
            
            //2.calc budget
            
            data.budget=data.totals.inc-data.totals.exp;
            
            //3.percentage clac
             //data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
           
            if(data.totals.inc > 0){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                data.percentage=-1;
            }
            
            
             
        },
        calculatePercentages:function(){
            data.allItems.exp.forEach(function(current){//forEach just loop and do something
                                                        //map loops and return
                
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercentages:function(){
            var percentages=data.allItems.exp.map(function(current){
                return current.percentage;
            });
            return percentages;
        },
        deleteItem:function(type,id){
            var IDs,index;
            IDs= data.allItems[type].map(function(current){//current ,index,array
                return current.id;
            });
            index=IDs.indexOf(id);
            //console.log(IDs);
            //console.log(index);
            if(index !== -1){
                data.allItems[type].splice(index,1);//splice deletes item or more
                                                    //slice make a copy of an array
            }
            
        },
        getBudget:function(){
            return{
                budget:data.budget,
                totalIncome:data.totals.inc,
                totalExpenses:data.totals.exp,
                percentage:data.percentage
            };
        },
        //this only for testing
        testing: function(){
            console.log(data);
        }
    }
    
})();

var UIController=(function(){
    var DOMStrings={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:".add__btn",
        incomeContainer:".income__list",
        expensesContainer:".expenses__list",
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercentageLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };
   var formatNumber=function(num,type){
             var numSplit,int,dec,sign;
             /*
             2300.5678--->+ 2,300.57
             
             */
             num=Math.abs(num);//removes sign
             num=num.toFixed(2);//only 2 decimals after point  //note that when applying methods directly to primitive type js                                                      //converts automatically to objects
             numSplit=num.split('.');
             int=numSplit[0];
             
             if(int.length>3){
                 int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
             }
             dec=numSplit[1];
             sign=(type==='inc')?'+':'-';
       //console.log(sign);
      // console.log(type);
             return (sign +' '+int+'.'+dec);
             
         };
     var nodeListForEach=function(list,callback){
                 for(var i=0;i<list.length;i++){
                     callback(list[i],i);
                 }
    };
    //handling inputs 
     return{
         getInputs: function(){
                   return{
                         type:document.querySelector(DOMStrings.inputType).value,//"inc" or "exp
                        description:document.querySelector(DOMStrings.inputDescription).value,//"blah"
                        value:parseFloat(document.querySelector(DOMStrings.inputValue).value)//"inc" or "exp
                   }

            },
         addListItem:function(obj,type){
             var html,newHtml,element;
             //create html with placeholder
             if(type==='inc'){
                 element=DOMStrings.incomeContainer;
                 html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%descripton%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
             }else if(type==='exp'){
                 element=DOMStrings.expensesContainer;
                 html=' <div class="item clearfix" id="exp-%id%"><div class="item__description">%descripton%</div>                            <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%   </div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>                                </div> </div></div>';
             }
             
             //replace placeholder text
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%descripton%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
             
             
             //add item to ui
             document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
         },
         deleteListItem(selectorID){
             var el=document.getElementById(selectorID);
             el.parentNode.removeChild(el);//to remove element we've to get its parent(parentNode)then remove child(wich is the                           //required el)
             
         },
         clearFields:function(){
             var fields,arrayFields;
             
             //this method returns a list not array so we can use array methods(slice)
             fields=document.querySelectorAll(DOMStrings.inputDescription+', '+DOMStrings.inputValue);
             
             //fields.slice()  //doesn't work it's not an array so use call method
             
             arrayFields=Array.prototype.slice.call(fields);//Array is the function constructor of array
             arrayFields.forEach(function(currentElement,index,array){
                 
                 currentElement.value="";
                 
             });
             
             //set focus back to description
             arrayFields[0].focus();
         },
         displayBudget:function(obj){
             var type;
             type=obj.budget>0?'inc':'exp';
             document.querySelector(DOMStrings.budgetLabel).textContent=formatNumber(obj.budget,type);
             document.querySelector(DOMStrings.incomeLabel).textContent=formatNumber(obj.totalIncome,'inc');
             document.querySelector(DOMStrings.expensesLabel).textContent=formatNumber(obj.totalExpenses,'exp');
             
             if(obj.percentage>0){
                 document.querySelector(DOMStrings.percentageLabel).textContent=obj.percentage+' %';
             }else{
                 document.querySelector(DOMStrings.percentageLabel).textContent='---';
             }
         },displayPercentages:function(percentages){
             var fields=document.querySelectorAll(DOMStrings.expensesPercentageLabel);
            // console.log(fields);
               nodeListForEach(fields,function(current,index){
                         if(percentages[index]>0){
                             current.textContent=percentages[index]+' %';
                         }else{
                              current.textContent='---';
                         }

                });
            
             
         },displayDate:function(){
             var now,year,month,months;
             now=new Date();
             year=now.getFullYear();
             month=now.getMonth();
             
             months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
             document.querySelector(DOMStrings.dateLabel).textContent=months[month]+" "+year;
             
             
             
         },changeType:function(){
             var fields=document.querySelectorAll(DOMStrings.inputType+','+
                                                 DOMStrings.inputDescription+','+
                                                 DOMStrings.inputValue);
             nodeListForEach(fields,function(current){
                 current.classList.toggle('red-focus');
             });
             document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
         },
         
        getDOMStrings:function(){
               return DOMStrings;
        }
    }
    
    
})();


var Controller=(function(budgetCtrl,UICtrl){
    var updateBudget=function(){
        //1.calc budget
        budgetCtrl.calculateBudget();
        
        //2.return budget
        var budget=budgetCtrl.getBudget();
        
        
        //3.display budget
        //console.log(budget);
        UICtrl.displayBudget(budget);
    }
    var updatePercentages=function(){
        //1.calc percentage
        budgetCtrl.calculatePercentages();
        
        //2.read percentages
        var percentages=budgetCtrl.getPercentages();
        
        //3.display percentage on UI
        //console.log(percentages);
        UICtrl.displayPercentages(percentages);
    }
    var ctrlAddItem=function(){
        var input,newItem;
        //1.get input fields
        input= UICtrl.getInputs()
        if((input.description!=="")&&!isNaN(input.value)&&input.value>0){
                    //2.add items to budget controller
                newItem=budgetCtrl.addItem(input.type,input.description,input.value);

                //3.add to UI
                UICtrl.addListItem(newItem,input.type);

                //4.clear fields
                UICtrl.clearFields();

                //5.budget calc and display
                updateBudget();
            
               //6.calc and update percentage
               updatePercentages();
        }
       
        
    }
    var ctrlDeleteItem=function(event){
        var itemID,splitID,type,ID;
        //deal with the element which fired the evevt
        itemID=(event.target.parentNode.parentNode.parentNode.parentNode.id);
        if(itemID){
            splitID=itemID.split('-');//[inc,1]
            type=splitID[0];
            ID=parseInt(splitID[1]);
            
            //1.delete from our data structure
            budgetCtrl.deleteItem(type,ID);
            //2.remove from UI
            UICtrl.deleteListItem(itemID);
            
            //3.updatebudget
            updateBudget();
            
              //4.calc and update percentage
            updatePercentages();
        }
    }
    var setEventListeners=function(){
           var DOM=UICtrl.getDOMStrings();
            document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
            document.addEventListener('keypress',function(event){//event is the only allowed parameter
            if(event.keyCode==13 ||event.which==13)//which for older browser
                ctrlAddItem();

             });
        //we set event handler to container(parent class)ehy??
        //1.there may be alot of element interested in
        //2.the elemnt won't be availble in loading the page
        /*
        
        event delegation
        */
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
    }
    
    return{
        init:function(){
            console.log("App started");
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget:0,
                totalIncome:0,
                totalExpenses:0,
                percentage:0
            });
            setEventListeners();
            
        }
    }
    
})(BudgetController,UIController);
Controller.init();










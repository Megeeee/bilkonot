document.addEventListener('DOMContentLoaded', () => {
    const calculatorForm = document.getElementById('calculator-form');
    const calculatorList = document.getElementById('calculator-list');
    const calculatorListUl = document.getElementById('calculator-list-ul');
    const calculatorUsage = document.getElementById('calculator-usage');
    const usageHeader = document.getElementById('usage-header');
    const calculatorItems = document.getElementById('calculator-items');
    const finalGradeParagraph = document.getElementById('final-grade')
    const addGradedItemBtn = document.getElementById('add-item')
    let itemsCount = 0;
    const gradedItemsContainer = document.getElementById('graded-items-container');
    const calculatorSearchInput = document.getElementById('calculator-search');
    const mainPageButton = document.getElementById('main-page-button');

     const apiBaseURL = 'http://localhost:5000/calculators'; // your api url

    let calculators = []; // Store calculators in memory (replace with backend API in real scenario)

    // function to generate HTML for each item
    function generateItemHTML(item) {
        let itemDiv = document.createElement("div")
        itemDiv.classList.add("graded-item")

        let nameInput = document.createElement("input")
        nameInput.type = "text"
        nameInput.placeholder = "Item Name"
        nameInput.value = item?.name || ""

        let typeSelect = document.createElement("select")
          const options = ["percentage"]
        for (let option of options) {
            let newOption = document.createElement("option")
            newOption.value = option
            newOption.textContent = option
            if (option == item?.type) {
                newOption.selected = true
            }
            typeSelect.appendChild(newOption)
        }

         let weightInput = document.createElement("input");
         weightInput.type = "number";
         weightInput.placeholder = "Weight (0-100)";
          weightInput.value = item?.weight || "";

          let outOfInput = document.createElement("input"); // New out of input element
         outOfInput.type = "number";
          outOfInput.placeholder = "Out Of";
          outOfInput.value = item?.outOf || "";


        let removeButton = document.createElement("button")
        removeButton.textContent = "Remove"
        removeButton.addEventListener('click', (e) => {
            e.preventDefault()
            gradedItemsContainer.removeChild(itemDiv)
        })
        itemDiv.appendChild(nameInput)
        itemDiv.appendChild(typeSelect)
        itemDiv.appendChild(weightInput)
         itemDiv.appendChild(outOfInput);
        itemDiv.appendChild(removeButton)

        return itemDiv
    }


    //Add graded item on click
    addGradedItemBtn.addEventListener('click', (e) => {
        e.preventDefault()
        let itemDiv = generateItemHTML()
        gradedItemsContainer.appendChild(itemDiv);

        itemsCount++;
    })


    // Function to create a new calculator
    async function createCalculator(name, items) {
        const newCalc = {
            name: name,
            items: items
        };

        try{
            const response = await fetch(apiBaseURL,{
               method: "POST",
              headers: {
                   'Content-Type': 'application/json',
              },
              body: JSON.stringify(newCalc),
            })
              if (!response.ok){
                   const errorData = await response.json()
                 console.error('Failed to create calculator', errorData)
               return;
              }
            const data = await response.json()
             calculators.push(data);
            renderCalculatorList();
            return data;
           } catch (error) {
           console.error('Error creating calculator:', error);
              }

       }


    // Function to display calculators
    async function renderCalculatorList() {
        calculatorListUl.innerHTML = '';
          try{
           const response = await fetch(apiBaseURL);
         if (!response.ok){
           console.error('Failed to fetch calculators')
             return;
          }
         const data = await response.json()
         calculators = data;
        const searchTerm = calculatorSearchInput.value.toLowerCase();
          const filteredCalculators = calculators.filter(calc =>
             calc.name.toLowerCase().includes(searchTerm)
          );
        filteredCalculators.forEach(calc => {
               const li = document.createElement('li');
            li.textContent = calc.name;
             const useBtn = document.createElement("button");
            useBtn.textContent = "Use";
             useBtn.addEventListener('click', () => { loadCalculatorToUse(calc._id) }) // use `calc._id`
             const removeBtn = document.createElement('button')
            removeBtn.textContent = "Remove Calculator";
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                removeCalculator(calc._id); // use `calc._id`
          })
            li.appendChild(useBtn)
           li.appendChild(removeBtn)
            calculatorListUl.appendChild(li);
          });
        }
        catch (error) {
           console.error('Error fetching calculators:', error);
       }
    }


    async function loadCalculatorToUse(calculatorId) {
          calculatorForm.style.display = "none"
        calculatorList.style.display = "none"
        calculatorUsage.style.display = "block"
         try {
          const response = await fetch(`${apiBaseURL}/${calculatorId}`);
             if (!response.ok){
                 console.error("Failed to fetch calculator")
                 return;
             }
             const calculator = await response.json();
              usageHeader.textContent = calculator.name;
             calculatorItems.innerHTML = "";
            for (let item of calculator.items) {
               let itemDiv = document.createElement('div')
               let input = document.createElement('input');
               input.type = 'number'
                input.placeholder = `Enter grade for ${item.name} `;
               itemDiv.appendChild(document.createTextNode(`${item.name} (weight: ${item.weight}, out of: ${item.outOf}):`))
               itemDiv.appendChild(input);
               calculatorItems.appendChild(itemDiv)
          }
         const calculateButton = document.getElementById('calculate')
         calculateButton.addEventListener('click', () => calculateGrade(calculator.items, calculatorId))
       } catch (error) {
           console.error("Error while fetching calculator for use")
       }
   }
   function showMainPage(){
      calculatorForm.style.display = "block"
       calculatorList.style.display = "block"
       calculatorUsage.style.display = "none"
    }


    function calculateGrade(items, calculatorId) {
        let totalGrade = 0;
        let totalWeight = 0;
         let inputs = document.querySelectorAll("#calculator-items input")
        if (inputs.length != items.length) {
             console.error("Some inputs missing")
             return;
         }
        for (let i = 0; i < items.length; i++) {
            let input = inputs[i];
           let item = items[i]
            let grade = parseFloat(input.value);
             let outOf = parseFloat(item.outOf);
          if (isNaN(grade) || grade < 0) {
                console.error(`Invalid grade ${grade} at index ${i} `);
                return;
             }
             if (isNaN(outOf) || outOf < 0) {
                console.error(`Invalid out of at index ${i} `);
                return;
            }
           totalGrade += (grade/outOf) * 100* (parseFloat(item.weight) / 100); // Calculate % and weight
            totalWeight += (parseFloat(item.weight) / 100); // Calculate weight
       }
        if (totalWeight === 0) {
            console.error("Cannot calculate a grade with total weight 0")
            return;
       }
        let finalGrade = (totalGrade / totalWeight).toFixed(2);
        finalGradeParagraph.textContent = `Final Grade: ${finalGrade} %`;
    }

    // Save Calculator Functionality
    calculatorForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        const nameInput = document.getElementById('calculator-name');
        let items = [];
       let itemDivs = document.querySelectorAll("#graded-items-container .graded-item")
        for (let div of itemDivs) {
            let item = {
                name: div.querySelector("input[type='text']").value,
                type: div.querySelector("select").value,
                 weight: parseFloat(div.querySelector("input[placeholder='Weight (0-100)']").value), // select by placeholder name
                 outOf: parseFloat(div.querySelector("input[placeholder='Out Of']").value), // select by placeholder name
            }
              if (isNaN(item.weight)) {
                alert("Please enter a valid weight")
               return
           }
            if (isNaN(item.outOf)) {
                alert("Please enter a valid out of value")
               return
            }
          if (item.weight < 0 || item.weight > 100) {
               alert("Please enter a weight between 0 and 100")
               return
           }
           if (item.outOf <= 0) {
              alert("Please enter a valid 'out of' value")
               return
            }
            items.push(item)
        }
        if (items.length <= 0) {
            alert("Please add one graded item at least")
            return
        }

        createCalculator(nameInput.value, items);
        nameInput.value = ""; // Clear form
        gradedItemsContainer.innerHTML = "";
        itemsCount = 0;
    });
   async function removeCalculator(id) {
    try{
        const response = await fetch(`${apiBaseURL}/${id}`,{method:'DELETE'})
         if(!response.ok){
            console.error("Error removing calculator: ", response.statusText)
          }
         calculators = calculators.filter(calc => calc._id !== id);
         renderCalculatorList();
        }
      catch(error){
          console.error("Error when removing calculator", error)
      }
   }
    //Initial list render
      renderCalculatorList();

    //Search logic
    calculatorSearchInput.addEventListener('input', renderCalculatorList);

      //Main page functionality
    mainPageButton.addEventListener('click', showMainPage)

});
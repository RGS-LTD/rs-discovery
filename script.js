// Track scores and current question
let currentQuestion = 0;
let scores = {
  Analytical: 0,
  Creative: 0,
  Investigative: 0,
  Literary: 0,
  "Perspective-Taking": 0,
};

var matchedPersona;
var sortedResults;
var top1;
var top2;
var personaKey;

// Preload images function
function preloadImages() {
  const imagePromises = quizData.map((data) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error(`Failed to load image: ${data.img}`));
      img.src = data.img;
    });
  });

  return Promise.all(imagePromises);
}

// Get DOM elements
const img = document.getElementById("question-gif");
const context = document.getElementById("context");
const questionNo = document.getElementById("questionNo");
const questionElement = document.getElementById("question");
const optionButtons = {
  option1: document.getElementById("option1"),
  option2: document.getElementById("option2"),
  option3: document.getElementById("option3"),
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Handle option selection
function handleOptionClick(option) {
  if (currentQuestion < quizData.length) {
    const scoreType = option.dataset.scoreType;
    scores[scoreType]++;

    currentQuestion++;
    updateQuiz();
  }
}

// Add click event listeners to option buttons
Object.values(optionButtons).forEach((button) => {
  button.addEventListener("click", () => handleOptionClick(button));
});

function updateQuiz() {
  if (currentQuestion < quizData.length) {
    
    document.getElementById("column2").classList.add("fade-out");

    setTimeout(() => {
      const currentQuizData = quizData[currentQuestion];
      img.src = currentQuizData.img;
      context.textContent = currentQuizData.context;
      questionNo.textContent = currentQuizData.questionNo;
      questionElement.textContent = currentQuizData.question;

      // Preload the next image if it exists
      if (currentQuestion + 1 < quizData.length) {
        const nextImg = new Image();
        nextImg.src = quizData[currentQuestion + 1].img;
      }


      // Get and shuffle options
      const optionEntries = Object.entries(currentQuizData.options);
      const shuffledEntries = shuffleArray([...optionEntries]);

      console.log("Shuffled options:");
      // Assign and log shuffled options to buttons
      Object.values(optionButtons).forEach((button, index) => {
        const [characteristic, text] = shuffledEntries[index];
        button.textContent = text;
        button.dataset.scoreType = characteristic;
      });

      window.scrollTo(0, 0);
      document.getElementById("column2").classList.remove("fade-out");

    }, 400);
  } else {
    showResults();
  }
}

function createSpiderChart(scores) {
  // Calculate percentages
  const percentages = Object.entries(scores).map(
    ([type, score]) => (score / quizData.length) * 100
  );

  // Create canvas element
  const canvas = document.createElement("canvas");
  canvas.id = "resultsChart";
  canvas.style.maxWidth = "400px";
  canvas.style.maxHeight = "250px";
  canvas.style.display = "float";

  // Create the chart
  new Chart(canvas, {
    type: "radar",
    data: {
      labels: ["Analytical", "Creative", "Investigative", "Literary", "Perspective-taking"],
      datasets: [
        {
          label: "Your Profile",
          data: percentages,
          fill: true,
          backgroundColor: "rgba(184, 233, 148, 0.5)",
          pointBackgroundColor: "rgba(184, 233, 148,1.0)",
          pointBorderColor: "#fff",
        },
      ],
    },
    options: {
      elements: {
        line: {
          borderWidth: 3,
        },
      },
      scales: {
        r: {
          angleLines: {
            display: true,
            color: "#ffffff",
          },
          grid: {
            color: "#ffffff",
          },
          pointLabels: {
            color: "#ffffff",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          min: 0,
          max: 50,
          ticks: {
            display: false,
            stepSize: 10,
            max: 50,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });

  return canvas;
}

async function showResults() {
  // Show loading screen
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.style.display = "flex";
  loadingScreen.style.opacity = "1";

sortedResults = Object.entries(scores).map(([type, score]) => ({
  type: type,
  percentage: ((score / quizData.length) * 100).toFixed(0),
}));
sortedResults.sort((a, b) => b.percentage - a.percentage);

// Find all characteristics tied for first place
const tiedForFirst = sortedResults.filter(
  (result) => result.percentage === sortedResults[0].percentage
);

let top1, top2;

if (tiedForFirst.length >= 2) {
  // If there are 2 or more tied for first place, randomly pick 2 of them
  const shuffledTied = [...tiedForFirst].sort(() => 0.5 - Math.random());
  top1 = shuffledTied[0];
  top2 = shuffledTied[1];
} else {
  // Only one characteristic has the highest score
  top1 = tiedForFirst[0];
  
  // Find the second highest percentage
  const remainingResults = sortedResults.filter(
    (result) => result.percentage < sortedResults[0].percentage
  );
  
  if (remainingResults.length > 0) {
    // Find all characteristics tied for second place
    const tiedForSecond = remainingResults.filter(
      (result) => result.percentage === remainingResults[0].percentage
    );
    
    // Randomly select one from the tied characteristics for second place
    top2 = tiedForSecond[Math.floor(Math.random() * tiedForSecond.length)];
  }
}
  
  // Create persona key
  personaKey = [top1.type, top2.type].sort().join("-");
  

  // Simulate loading screen
  await new Promise((resolve) => setTimeout(resolve, 1000));

  matchedPersona = personas[personaKey];
  var firstProg = progRecco[top1.type];
  var secondProg = progRecco[top2.type];
  const displayedProg = new Set(firstProg.prog.map(item => item.name));
  const filteredSecondProg = secondProg.prog.filter(item => !displayedProg.has(item.name));
  const prog = document.getElementById("top-prog-reco");
  const moreProg = document.getElementById("more-prog-reco");
  questionNo.innerHTML = "YOUR CHARACTERISTICS";
  questionNo.style.fontSize = "18px";
  questionElement.style.display = "none";
  document.getElementById("column1").style.textAlign = "left";
  document.getElementById("persona-title").innerHTML =
    "<br>" + matchedPersona.title;
  document.getElementById("persona-title").style.display = "block";
  document.getElementById("persona-description").innerHTML =
    matchedPersona.description +
    "<br /><br/><b>Strengths:</b> " +
    matchedPersona.strengths;
  document.getElementById("persona-description").style.display = "block";
  img.src = matchedPersona.img;
  setImageWidth();
  prog.innerHTML = `<b>TOP RS PROGRAMMES FOR YOU:</b>
<ul>
  ${firstProg.prog
    .map(
      (programme) =>
        `<li><a href="${programme.url}" target="_blank">${programme.name}</a></li>`
    )
    .join("")}
</ul></br>`;
  moreProg.innerHTML = `<b>OTHER SUITABLE OPTIONS:</b>
<ul>
  ${filteredSecondProg.map(
      (xtraProg) =>
        `<li><a href="${xtraProg.url}" target="_blank">${xtraProg.name}</a></li>`
    )
    .join("")}
</ul>`;

  // Create a container for both results and chart
  const resultsContainer = document.createElement("div");
  resultsContainer.id = "statsBox";
  resultsContainer.style.display = "float";
  resultsContainer.style.justifyContent = "left";
  resultsContainer.style.alignItems = "top";
  resultsContainer.style.gap = "2rem";
  resultsContainer.style.maxWidth = "1200px";

  // Create results text
  const resultsElement = document.createElement("div");
  resultsElement.style.display = "float";
  let resultsText = "";
  Object.keys(scores).forEach((key) => {
    const percentage = ((scores[key] / quizData.length) * 100).toFixed();
    resultsText += `${key}: ${percentage}%<br>`;
  });
  resultsElement.innerHTML = resultsText;

  // Create chart container
  const chartContainer = document.createElement("div");
  chartContainer.style.display = "float";
  chartContainer.style.minWidth = "300px";
  chartContainer.style.margin = "0";

  // Create and add the spider chart
  const chartCanvas = createSpiderChart(scores);
  chartContainer.appendChild(chartCanvas);

  // Add both elements to the container
  resultsContainer.appendChild(chartContainer);
  resultsContainer.appendChild(resultsElement);

  // Hide option buttons
  Object.values(optionButtons).forEach((button) => {
    button.style.display = "none";
  });

  document.getElementById('padlet-link').style.display = "inline";
  document.getElementById("redoBtn").style.display = "inline";

  // Add the container after the question element
  questionElement.after(resultsContainer);

    window.scrollTo(0, 0);
  
  // Hide loading screen
  loadingScreen.style.transition = "1s";
  loadingScreen.style.opacity = "0";
  
  setTimeout(function() {
    loadingScreen.style.display = "none";
}, 500);

}

function setImageWidth() {
  const img = document.getElementById("question-gif");
  if (window.innerWidth <= 500) {
    img.style.width = "90%";
    document.getElementById("column1").style.padding = "0px";
  } else {
    img.style.width = "60%";
    document.getElementById("column1").style.paddingRight = "50px";
  }
}

// Add event listener for window resize
window.addEventListener("resize", setImageWidth);

// Start the quiz
updateQuiz();

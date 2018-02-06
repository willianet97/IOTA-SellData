function openInstructions() {
    var x = document.getElementById("instructionsDiv");
    var y = document.getElementById("InstructionBar");
    if (x.style.display === "none" && y.style.display === "block") {
        x.style.display = "block";
        y.style.display = "none";
    } else {
        x.style.display = "none";
    }
}
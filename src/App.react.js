const localStorageKey = "pbrn46_recipes";

const defaultRecipes = [
  {name: "Salted Fish", ingredients: ["Salt", "Fish"]},
  {name: "Candy", ingredients: ["Sugar", "Food Color"]}
];

class AddEditRecipeModal extends React.Component {
  constructor(props) {
    super(props);
    this.defaultState = {
      mode: "add",  // either "add" or "edit"
      verifyErrors: [],
      recipeName: "",
      recipeIngredients: ""
    }
    this.state = this.defaultState;
    this.onRecipeNameChange = this.onRecipeNameChange.bind(this);
    this.onRecipeIngredientsChange = this.onRecipeIngredientsChange.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.onAddClick = this.onAddClick.bind(this);
  }
  buildRecipe() {
    var ingredients = this.state.recipeIngredients.split(',');
    ingredients = ingredients.map((value) => {return value.trim();});
    var newRecipe = {name: this.state.recipeName, ingredients: ingredients};
    return newRecipe;
  }
  onRecipeNameChange(event) {
    this.setState({recipeName: event.target.value});
  }
  onRecipeIngredientsChange(event) {
    this.setState({recipeIngredients: event.target.value});
  }
  onSaveClick(event) {
    if (this.verify()) {
      this.props.onSaveRecipe(this.props.editingRecipeId, this.buildRecipe());
      this.hide();
    }
  }
  onAddClick(event) {
    if (this.verify()) {
      this.props.onAddRecipe(this.buildRecipe());
      this.hide();
    }
  }
  verify() {  // Returns true if no errors.
    var currentErrors = [];
    if (this.state.recipeName.trim() === "") {
      currentErrors.push("Recipe name cannot be empty.");
    }
    if (this.state.recipeIngredients.trim() === "") {
      currentErrors.push("Ingredients list cannot be empty.");
    }
    this.setState({verifyErrors: currentErrors});
    if (currentErrors.length === 0) {
      return true;
    } else {
      return false;
    }
  }
  hide() {
    this.recipeModal.modal('hide');
  }
  componentWillReceiveProps(nextProps) {
    var newState = Object.assign({}, this.defaultState);
    if (nextProps.editingRecipe) {
      newState = Object.assign(newState, {
        mode: "edit",
        recipeName: nextProps.editingRecipe.name,
        recipeIngredients: nextProps.editingRecipe.ingredients.join(', '),
      });
    }
    this.setState(newState);
  }
  componentDidMount() {
    this.recipeModal = $('#addEditRecipeModal');
  }
  render() {
    var confirmButton;
    var title;
    if (this.state.mode === "add") {
      title = "Add a Recipe";
      confirmButton =
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.onAddClick}>
          Add to List</button>
    }
    if (this.state.mode === "edit") {
      title = "Editing Recipe";
      confirmButton =
        <button
          type="button"
          className="btn
          btn-primary"
          onClick={this.onSaveClick}>
          Save Changes</button>
    }
    var verifyErrors = [];
    for (var i in this.state.verifyErrors) {
      verifyErrors.push(
        <div key={i}>{this.state.verifyErrors[i]}</div>
      );
    }
    return (
      <div id="addEditRecipeModal" className="modal fade recipeModal" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title h3">{title}</div>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {verifyErrors.length > 0 && (<div className="alert alert-danger">{verifyErrors}</div>)}
              <div className="form-group">
                <label htmlFor="addRecipe-recipeName">Name</label>
                <input
                  type="text"
                  id="addRecipe-recipeName"
                  className="form-control"
                  placeholder="Recipe Name"
                  onChange={this.onRecipeNameChange}
                  value={this.state.recipeName}
                />
                <label htmlFor="addRecipe-recipeIngredients">Ingredients</label>
                <textarea
                  id="addRecipe-recipeIngredients"
                  className="form-control"
                  placeholder="Recipe ingredients, seperated with commas (,)"
                  rows="5"
                  onChange={this.onRecipeIngredientsChange}
                  value={this.state.recipeIngredients}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-warning" data-dismiss="modal">Cancel</button>
              {confirmButton}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class RecipeListItem extends React.Component {
  render() {
    return (
      <div className="list-group-item recipeListItem">
        {this.props.ingredient}
      </div>
    );
  }
}

class RecipeCard extends React.Component {
  renderRecipeIngredients(ingredients) {
    var recipeIngredients = [];
    for (var i in ingredients) {
      recipeIngredients.push(<RecipeListItem key={i} recipeId={this.props.recipeId} ingredient={ingredients[i]} />);
    }
    return recipeIngredients;
  }
  render() {
    var recipeIngredients = this.renderRecipeIngredients(this.props.recipe.ingredients);
    return (
      <div className="card recipeCard">
        <div className="card-header collapsed"
          data-toggle="collapse"
          data-parent="#accordion"
          data-target={"#recipe-collapse-" + this.props.recipeId}
        >
          <span className="h3">
            {this.props.recipe.name}
          </span>
          <span className="expand-helper ml-2">[Expand]</span>
          <span className="hide-helper ml-2">[Hide]</span>
        </div>
        <div id={"recipe-collapse-" + this.props.recipeId} className="collapse">
          <div className="card-block">
            <span className="h4">Ingredients</span>
          </div>
          {recipeIngredients}
        <div className="card-footer">
          <div className="d-flex">
          <button
            type="button"
            className="btn btn-sm btn-danger mr-2"
            onClick={(event) => this.props.onDeleteClick(this.props.recipeId)}>
            Delete</button>
          <button
            type="button"
            className="btn btn-sm btn-warning mr-2"
            onClick={(event) => this.props.onEditClick(this.props.recipeId)}>
            Edit</button>
          </div>
        </div>
        </div>
      </div>
    );
  }
}

class RecipeList extends React.Component {
  renderRecipeList(recipes) {
    var recipeList = [];
    for (var i in recipes) {
      recipeList.push(
        <RecipeCard
          key={i}
          recipeId={i}
          recipe={recipes[i]}
          onEditClick={this.props.onEditClick}
          onDeleteClick={this.props.onDeleteClick} />
      );
    }
    return recipeList;
  }
  render() {
    var recipeList = this.renderRecipeList(this.props.recipes);
    var emptyListHint = "";
    if (this.props.recipes.length === 0) {
      emptyListHint = <div className="card-block">Your recipe list is empty! Click 'Add Recipe' to begin.</div>;
    }
    return (
      <div className="card recipeList" id="accordion">
        {emptyListHint}
        {recipeList}
      </div>
    );
  }
}

class RecipeBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
      editingRecipe: null
    }
    this.onSaveRecipe = this.onSaveRecipe.bind(this);
    this.onAddRecipe = this.onAddRecipe.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
    this.onAddClick = this.onAddClick.bind(this);
  }
  onSaveRecipe(recipeId, recipe) {
    this.setState((prevState, props) => {
      var newRecipes = prevState.recipes.slice();
      newRecipes[recipeId] = recipe;
      return {recipes: newRecipes};
    });
  }
  onAddRecipe(recipe) {
    this.setState((prevState, props) => {
      var newRecipes = prevState.recipes.slice();
      newRecipes.push(recipe);
      return({recipes: newRecipes});
    });
  }
  onDeleteClick(recipeId) {
    this.setState((prevState, props) => {
      var newRecipes = prevState.recipes.slice();
      newRecipes.splice(recipeId, 1);
      return {recipes: newRecipes};
    });
  }
  onEditClick(recipeId) {
    this.setState((prevState, props) => {
      return {editingRecipe: prevState.recipes[recipeId], editingRecipeId: recipeId};
    });
    $('#addEditRecipeModal').modal('show');
  }
  onResetClick() {
    this.resetLocalStorage();
  }
  onAddClick(event) {
    this.setState((prevState, props) => {
      return {editingRecipe: null};
    });
    $('#addEditRecipeModal').modal('show');
  }
  componentWillUpdate(nextProps, nextState) {
    if (this.state.recipes !== nextState.recipes) {
      localStorage.setItem(localStorageKey, JSON.stringify(nextState.recipes));
    }
  }
  resetLocalStorage() {
    this.setState({recipes: defaultRecipes});
  }
  componentDidMount() {
    // Load from local storage here
    // If nothing in local storage, load default.
    var localRecipes;
    try {
      localRecipes = JSON.parse(localStorage.getItem(localStorageKey));
    }
    catch (e) {
      if (e instanceof SyntaxError) {
        localRecipes = defaultRecipes;
      } else {
        throw e;
      }
    }
    if (localRecipes) {
      this.setState({recipes: localRecipes});
    } else {
      this.resetLocalStorage();
    }
  }
  render() {
    var toolbar =
        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-danger mr-2" onClick={this.onResetClick}>
            Reset Storage
          </button>
          <button type="button" className="btn btn-primary" onClick={this.onAddClick}>
            Add Recipe
          </button>
        </div>;
    return (
      <div className="container recipeBox">
        {toolbar}
        <RecipeList
          recipes={this.state.recipes}
          onDeleteClick={this.onDeleteClick}
          onEditClick={this.onEditClick} />
        {toolbar}
        <AddEditRecipeModal
          onSaveRecipe={this.onSaveRecipe}
          onAddRecipe={this.onAddRecipe}
          editingRecipe={this.state.editingRecipe}
          editingRecipeId={this.state.editingRecipeId} />
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="app">
        <div className="container">
          <div className="jumbotron">
            <h3>Recipe Box Challenge</h3>
            <p>Written by <a target="_blank" href="https://github.com/pbrn46/" rel="noopener noreferrer">Boris Wong</a>, 2017-06-20</p>
            <p>This app will save any changes to local browser storage. Clicking "Reset Storage" will clear all data and restore the initial sample data.</p>
            <h4>Features</h4>
            <ul>
              <li>Saves to local browser storage.</li>
              <li>Error checking for empty fields.</li>
              <li>Reset Storage, to reset everything to defaults.</li>
            </ul>
          </div>
        </div>
        <RecipeBox />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

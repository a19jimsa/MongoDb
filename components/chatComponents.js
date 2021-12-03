class Dialog extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    render() { 
        return <div className={this.props.class}>{this.props.children}</div>;
    }
}

class Like extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(){
        //Do something when clicked on button
    }

    render() { 
        return <li onClick={this.handleClick}>Gilla</li>;
    }
}

class ChatDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleComment = this.handleComment.bind(this);
        this.createAnswer = this.createAnswer.bind(this);
        this.handleUpdateComment = this.handleUpdateComment.bind(this);

        this.state = {error: null,  isLoaded: false, comments: [], show: true, button: "Chatta", content: "", highestId: [], showAnswer: false, class: "none", active_id: null, updateId: null};
        this.getHighestId();
    }

    async getHighestId(){
        await fetch("/comments/",{
            method : 'GET',
            headers: { 'Content-Type': 'application/json'}
        })
        .then((response) => response.json())
        .then(data=> {
            this.setState({highestId: data})
            console.log("Högsta id");
            console.log(this.state.highestId);
        })
    }

    async componentDidMount(){
        await fetch("/comments/"+this.props.name, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then((response) => response.json())
            .then(data => {
                this.setState({isLoaded: true, comments: data});
                this.getHighestId();
            },
            (error)=>{
                this.setState({isLoaded: true, error});
            }
        )
    }

    async addComment(replyto){
        const id = Math.max.apply(null, this.state.highestId.map(highestId => highestId.id))+1;
        const time = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
        const data = {
            "id" : id,
            "location" : this.props.name,
            "replyto" : replyto,
            "author" : "1",
            "content" : this.state.content,
            "posted" : time
        }
        //HTML5 API Fetch
        await fetch("/comments/"+this.props.name+"/comment/"+replyto, {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then((response) => response.json()).then(data => {
            this.componentDidMount();
            this.handleClick();
            this.handleClick();
            
        });
    }

    async updateComment(id){
        const time = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
        const data = {
            "id" : id,
            "location" : this.props.name,
            "content": this.state.content
        }
        //HTML5 API Fetch
        await fetch("/comments/"+this.props.name+"/comment/"+id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then((response) => response.json()).then(data => {
            this.componentDidMount();
            this.handleClick();
            this.handleClick();
        });
    }

    handleOnChange(e){
        this.setState({content: e.target.value});
        console.log(e.target.value);
    }

    handleClick(){
        this.state.show = !this.state.show;
        if(this.state.show){
            this.setState({button: "Stäng"});
        }else{
            this.setState({button: "Chatta"});
        }
    }

    handleComment(replyto){
        this.addComment(replyto);
        this.setState({active_id: null});
    }

    handleUpdateComment(id){
        this.updateComment(id);
        this.setState({updateId: null});
    }

    async createAnswer(){
        const id = Math.max.apply(null, this.state.highestId.map(highestId => highestId.id))+1;
        const time = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
        const data = {
            "id" : id,
            "location" : this.props.name,
            "replyto" : null,
            "author" : "1",
            "content" : this.state.content,
            "posted" : time
        }
        //create comment on city chatt
        await fetch("/comments/"+this.props.name, {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then((response) => response.json()).then(data => {
            this.componentDidMount();
            this.handleClick();
            this.handleClick();
        });
    }

    async removeComment(id){
        //HTML5 API Fetch
        await fetch("/comments/"+id, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json' }
        })
            .then((response) => response.json()).then(data => {
            this.componentDidMount();
        });
    }

    showAnswerInput(){
        this.state.showAnswer = !this.state.showAnswer;
        if(this.state.showAnswer){
            return (<div></div>)
        }else{
            return <div></div>;
        }
    }

    show(id){
        if(this.state.active_id == id){
            this.setState({class: "none", active_id: id});
            this.setState({active_id: "null"});
        }else{
            this.setState({class: "flex", active_id: id, updateId: null});
        }
    }

    showUpdate(id){
        if(this.state.updateId == id){
            this.setState({class: "none", updateId: id});
            this.setState({updateId: "null"});
        }else{
            this.setState({class: "flex", updateId: id, active_id: null});
        }
    }

    draw(){
        const {error, isLoaded, comments} = this.state;
        if(error){
            return <div>Error: {error.message}</div>;
        }else if(!isLoaded){
            return <div>Loading...</div>;
        }else if(this.state.show && isLoaded){
            return (
            <Dialog class="dialog"><h1>Väderchatt - {this.props.name}</h1>
                <div className="messageBox">
                {comments.map(tag=>
                    <div key={tag.id} className="messageContent">
                        <div>{tag.replyto == null ? "": "Detta är en kommentar på " + tag.replyto}</div>
                        <div className="message">
                            <div><p>{tag.id}</p><p>{tag.content}</p></div>
                        </div>
                        <ul><Like id={tag.id} /><li onClick={this.show.bind(this, tag.id)}>Kommentera</li><li onClick={this.showUpdate.bind(this, tag.id)}>Uppdatera</li><li onClick={this.removeComment.bind(this, tag.id)}>Ta bort</li><li>{tag.posted}</li></ul>
                        
                        <div className={this.state.active_id == tag.id ? this.state.class : "none"}>
                            <input type="text"onChange={this.handleOnChange}/>
                            <button onClick={this.handleComment.bind(this, tag.id)}>Svara</button>
                        </div>
                        <div className={this.state.updateId == tag.id ? this.state.class : "none"}>
                            <input type="text"onChange={this.handleOnChange}/>
                            <button onClick={this.handleUpdateComment.bind(this, tag.id)}>Uppdatera</button>
                        </div>
                        <Answer name={this.props.name} id={tag.id}/>
                    </div>
                    )}
                </div>
                <div className="inputBox">
                    <input type="text" onChange={this.handleOnChange}></input>
                    <button onClick={this.createAnswer}>Skicka</button>
                </div>
            </Dialog>
            )
        }
    }

    render() { 
        return (<div>{this.draw()}<button onClick={this.handleClick} className="chatButton">{this.state.button}</button></div>);
    }
}

class Answer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: null, isLoaded: false, comments: []};
    }

    async componentDidMount(){
        if(this.props.id != "null"){
            //HTML5 API Fetch
            await fetch("/comments/"+this.props.name+"?id="+this.props.id, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
                .then((response) => response.json())
                .then(data => {
                    this.setState({isLoaded: true, comments: data});
                },
                (error)=>{
                    this.setState({isLoaded: true, error});
                }
            )
        }
    }

    render() { 
        const {error, isLoaded, comments } = this.state;
        if(error){
            return <div>Error: {error.message}</div>
        }else if(comments.length > 0){
            return (<div>
                <div className="arrow">&#x21AA;</div>
                {comments.map(tag=>
                <div key={tag.id} className="answerContent">
                    <div className="answerMessage right">
                        <p>{tag.id}</p><p>{tag.content}</p>
                    </div>
                </div>)}
            </div>
            );
        }else{
            return <div></div>;
        }
    }
}

class CreateUserDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {username: "", email: "", show: false, users: []};
        this.handleClick = this.handleClick.bind(this);
        this.createUser = this.createUser.bind(this);
        this.usernameOnChange = this.usernameOnChange.bind(this);
        this.emailOnChange = this.emailOnChange.bind(this);
        this.deleteOnClick = this.deleteOnClick.bind(this);
        this.getUsers();
    }

    async createUser(){
        const user = {
            id: Math.max.apply(null, this.state.users.map(id=>id.id))+1,
            username: this.state.username,
            email: this.state.email
        }
        await fetch("/users/", {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
            .then((response) => response.json()).then(data => {
        });
    }

    async getUsers(){
        await fetch("/users/", {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        })
        .then((response) => response.json())
        .then((data)=>{
            this.setState({users: data});
        },
        (error) => {
            console.log(error);
        })
    }

    async removeUser(username){
        await fetch("users/"+username, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        })
        .then((response) => response.json())
        .then((data)=>{
            alert("Tog bort" + username);
        })
    }
    
    deleteOnClick(username){
        this.removeUser(username);
    }

    handleClick(){
        this.state.show = !this.state.show;
        this.setState({show: this.state.show});
    }

    usernameOnChange(e){
        this.setState({username: e.target.value});
    }

    emailOnChange(e){
        this.setState({email: e.target.value});
    }
    showUsers(){
        if(this.state.users.length > 0){
            return (
                <div>
                    <h1>Användare</h1>
                    {this.state.users.map(tag=>
                    
                    <div key={tag.id}><p>{tag.id} {tag.username} {tag.email}<button onClick={this.deleteOnClick.bind(this, tag.username)}>Ta bort</button></p></div>
                    )}
                </div>
            )
        }else{
            return <div></div>
        }
    }

    render() {
        if(this.state.show){
        return (
        <div>
            <Dialog class="dialog">
                <h1>Skapa användare</h1>
                <div>
                    <label>Username: </label>
                    <input type="text" onChange={this.usernameOnChange}/>
                    <label>Email: </label>
                    <input type="text" onChange={this.emailOnChange}/>
                    <button onClick={this.createUser}>Skapa användare</button>
                    {this.showUsers()}
                </div>
            </Dialog>
            <button onClick={this.handleClick}>Skapa användare</button>
        </div>
        )
        }else{
            return (
            <div>
                <button onClick={this.handleClick}>Skapa användare</button>
            </div>
            )
        }
    }
}

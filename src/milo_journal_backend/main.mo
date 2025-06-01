// Academic Journal Platform - Backend en Motoko
import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";
import Debug "mo:base/Debug";

actor AcademicJournal {

    // Tipos de datos
    public type PaperStatus = {
        #Proposal;
        #InProcess;
        #Approved;
        #Rejected;
    };

    public type Paper = {
        id: Nat;
        title: Text;
        author: Text;
        authorPrincipal: Principal;
        content: Text;
        status: PaperStatus;
        timestamp: Int;
        votes: Int;
        reviewers: [Principal];
    };

    public type User = {
        principal: Principal;
        username: Text;
        walletAmount: Nat;
        publishedPapers: [Nat];
        reviewedPapers: [Nat];
    };

    public type Vote = {
        paperId: Nat;
        voter: Principal;
        approve: Bool;
        timestamp: Int;
    };

    // Estado del sistema
    private stable var nextPaperId: Nat = 0;
    private var papers = HashMap.HashMap<Nat, Paper>(10, Nat.equal, func(n: Nat) : Nat32 { 
        Debug.print("Hashing paper ID: " # Nat.toText(n));
        Nat32.fromNat(n % (2**32 - 1))
    });
    private var users = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);
    private var votes = HashMap.HashMap<Text, Vote>(10, Text.equal, Text.hash);

    // Registrar usuario
    public shared(msg) func registerUser(username: Text) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case (?_existing) { #err("Usuario ya registrado") };
            case null {
                let newUser: User = {
                    principal = caller;
                    username = username;
                    walletAmount = 1000; // Tokens iniciales
                    publishedPapers = [];
                    reviewedPapers = [];
                };
                users.put(caller, newUser);
                #ok("Usuario registrado exitosamente")
            };
        }
    };

    // Obtener información del usuario
    public shared(msg) func getUserInfo() : async Result.Result<User, Text> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case (?user) { #ok(user) };
            case null { #err("Usuario no encontrado") };
        }
    };

    // Publicar propuesta de paper
    public shared(msg) func submitPaper(title: Text, content: Text) : async Result.Result<Nat, Text> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case null { #err("Usuario no registrado") };
            case (?user) {
                if (user.walletAmount < 100) {
                    return #err("Fondos insuficientes para publicar");
                };

                let paper: Paper = {
                    id = nextPaperId;
                    title = title;
                    author = user.username;
                    authorPrincipal = caller;
                    content = content;
                    status = #Proposal;
                    timestamp = Time.now();
                    votes = 0;
                    reviewers = [];
                };

                papers.put(nextPaperId, paper);
                
                // Actualizar usuario (deducir tokens)
                let updatedUser: User = {
                    principal = user.principal;
                    username = user.username;
                    walletAmount = user.walletAmount - 100;
                    publishedPapers = Array.append(user.publishedPapers, [nextPaperId]);
                    reviewedPapers = user.reviewedPapers;
                };
                users.put(caller, updatedUser);

                let paperId = nextPaperId;
                nextPaperId += 1;
                #ok(paperId)
            };
        }
    };

    // Votar en un paper
    public shared(msg) func votePaper(paperId: Nat, approve: Bool) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        let voteKey = Nat.toText(paperId) # Principal.toText(caller);

        // Verificar si ya votó
        switch (votes.get(voteKey)) {
            case (?_existing) { return #err("Ya has votado en este paper") };
            case null {};
        };

        switch (papers.get(paperId)) {
            case null { #err("Paper no encontrado") };
            case (?paper) {
                if (paper.authorPrincipal == caller) {
                    return #err("No puedes votar tu propio paper");
                };

                // Registrar voto
                let vote: Vote = {
                    paperId = paperId;
                    voter = caller;
                    approve = approve;
                    timestamp = Time.now();
                };
                votes.put(voteKey, vote);

                // Actualizar paper
                let newVotes = if (approve) { paper.votes + 1 } else { paper.votes - 1 };
                let newStatus = if (newVotes >= 3) { #Approved } 
                              else if (newVotes <= -3) { #Rejected } 
                              else { #InProcess };

                let updatedPaper: Paper = {
                    id = paper.id;
                    title = paper.title;
                    author = paper.author;
                    authorPrincipal = paper.authorPrincipal;
                    content = paper.content;
                    status = newStatus;
                    timestamp = paper.timestamp;
                    votes = newVotes;
                    reviewers = Array.append(paper.reviewers, [caller]);
                };
                papers.put(paperId, updatedPaper);

                // Recompensar al votante
                switch (users.get(caller)) {
                    case (?user) {
                        let updatedUser: User = {
                            principal = user.principal;
                            username = user.username;
                            walletAmount = user.walletAmount + 50; // Recompensa por revisar
                            publishedPapers = user.publishedPapers;
                            reviewedPapers = Array.append(user.reviewedPapers, [paperId]);
                        };
                        users.put(caller, updatedUser);
                    };
                    case null {};
                };

                #ok("Voto registrado exitosamente")
            };
        }
    };

    // Obtener todos los papers
    public query func getAllPapers() : async [Paper] {
        Iter.toArray(papers.vals())
    };

    // Obtener paper por ID
    public query func getPaper(paperId: Nat) : async Result.Result<Paper, Text> {
        switch (papers.get(paperId)) {
            case (?paper) { #ok(paper) };
            case null { #err("Paper no encontrado") };
        }
    };

    // Obtener papers por estado
    public query func getPapersByStatus(status: PaperStatus) : async [Paper] {
        let allPapers = Iter.toArray(papers.vals());
        Array.filter(allPapers, func(paper: Paper) : Bool {
            switch (paper.status, status) {
                case (#Proposal, #Proposal) { true };
                case (#InProcess, #InProcess) { true };
                case (#Approved, #Approved) { true };
                case (#Rejected, #Rejected) { true };
                case (_, _) { false };
            }
        })
    };

    // Obtener estadísticas del sistema
    public query func getSystemStats() : async {totalPapers: Nat; totalUsers: Nat; approvedPapers: Nat} {
        let allPapers = Iter.toArray(papers.vals());
        var approvedCount = 0;
        
        for (paper in allPapers.vals()) {
            switch (paper.status) {
                case (#Approved) { approvedCount += 1 };
                case (_) {};
            }
        };

        {
            totalPapers = papers.size();
            totalUsers = users.size();
            approvedPapers = approvedCount;
        }
    };
}

import Blob "mo:base/Blob";
import HashMap "mo:base/HashMap";
import Cycles "mo:base/ExperimentalCycles";
import Text "mo:base/Text";
import Types "Types";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

actor {
  var favoritebook = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash);

  public func addBook(name : Text, url : Text) : async Text {
    let response: Types.CanisterHttpResponsePayload = await proxy(url);
    let decodedResponse : Text = await decodeResponse(response.body);

    favoritebook.put(name, decodedResponse);
    Debug.print("Your favorite book has been saved, " # name # "! Thanks :D");

    return decodedResponse;
  };

  public func getRandomBook() : async Text {
    let response: Types.CanisterHttpResponsePayload = await proxy("https://openlibrary.org/random");
    
    let randomBook: Text = await getLocationHeaders(response.headers);

    let randomBookInfo: Types.CanisterHttpResponsePayload = await proxy(randomBook # ".json");
    let decodedResponse : Text = await decodeResponse(randomBookInfo.body);

    return decodedResponse;
  };

  public func getBook(account : Text): async ?Text {
    return favoritebook.get(account);
  };

  public func searchBook(queryString : [Text]): async Text {
    var url = "https://openlibrary.org/search.json?q=";
    
    for (word in queryString.vals()) {
      url := url # word #"%20";
    };
    url := Text.trimEnd(url, #char '0');
    url := Text.trimEnd(url, #char '2');
    url := Text.trimEnd(url, #char '%');

    url := url # "&_spellcheck_count=0&limit=10&fields=key,cover_i,title,subtitle,author_name,name&mode=everything";

    let response: Types.CanisterHttpResponsePayload = await proxy(url);
    let decodedResponse : Text = await decodeResponse(response.body);

    return decodedResponse;
  };

  public func getAllBooks() : async [(Text, Text)] {
    return Iter.toArray<(Text, Text)>(favoritebook.entries());
  };

  public func proxy(url : Text) : async Types.CanisterHttpResponsePayload {

    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    // Construct canister request
    let request : Types.CanisterHttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = [];
      body = null;
      method = #get;
      transform = ?transform_context;
    };

    Cycles.add(220_000_000_000);
    let ic : Types.IC = actor ("aaaaa-aa");
    let response : Types.CanisterHttpResponsePayload = await ic.http_request(request);
    return response;
  };

  public query func transform(raw : Types.TransformArgs) : async Types.CanisterHttpResponsePayload {
    let transformed : Types.CanisterHttpResponsePayload = {
      status = raw.response.status;
      body = raw.response.body;
      headers = raw.response.headers;
    };
    transformed;
  };

  public func decodeResponse(body : [Nat8]) : async Text {
    let text_decoded: ?Text = Text.decodeUtf8(Blob.fromArray(body));

    let checked_text : Text = switch text_decoded {
      case null "";
      case (?Text) Text;
    };

    checked_text;
  };

  public func getLocationHeaders(headers: [Types.HttpHeader]) : async Text {
    for (header in headers.vals()) {
      if (header.name == "location") {
        return header.value;
      }
    };
    return "";
  };
};

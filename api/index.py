from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>", methods=["GET", "POST"])
def catch_all(path):
    # This will be our API endpoint
    if request.method == "POST":
        data = request.json
        email_text = data.get("email")

        return jsonify(
            {"message": "We received your email", "received_text": email_text}
        )

    return jsonify({"message": "Hello from the Python backend!"})


# This part only runs when you start it locally
if __name__ == "__main__":
    app.run(debug=True, port=5001)

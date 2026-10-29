# Script to generate SQL seed for Trusting Social tournament

tournament_id = 'c90dd0b1-a512-412b-ba3c-e7ae4d40db73'

teams_data = [
    {
        "num": 1,
        "name": "Đội 1",
        "short_name": "Đ1",
        "emoji": "1️⃣",
        "players": [
            ("Bảo Thái", "m", "Bảo"),
            ("Lê Thanh Nhân", "m", "Nhân"),
            ("Nguyễn Lê Phi Long", "m", "P.Long"),
            ("Phạm Quốc Long", "m", "Q.Long"),
            ("Sang", "m", "Sang"),
            ("Thảo Đặng", "f", "Thảo"),
        ]
    },
    {
        "num": 2,
        "name": "Đội 2",
        "short_name": "Đ2",
        "emoji": "2️⃣",
        "players": [
            ("Giang", "m", "Giang"),
            ("Guong Pham", "f", "Gương"),
            ("Luân pickleball", "m", "Luân"),
            ("Nguyễn Minh Thiên", "m", "Thiên"),
            ("Phuc Cao", "f", "Phúc"),
            ("Trần Văn Tú", "m", "Tú"),
        ]
    },
    {
        "num": 3,
        "name": "Đội 3",
        "short_name": "Đ3",
        "emoji": "3️⃣",
        "players": [
            ("Dũng thứ 2", "m", "Dũng"),
            ("Huy Vũ", "m", "Huy"),
            ("Minh - RiskVN", "m", "Minh"),
            ("Nguyễn Ngô Minh Đức", "m", "Đức"),
            ("Oanh", "f", "Oanh"),
            ("Trần Minh Khánh", "m", "Khánh"),
        ]
    },
    {
        "num": 4,
        "name": "Đội 4",
        "short_name": "Đ4",
        "emoji": "4️⃣",
        "players": [
            ("An Nguyễn", "m", "An"),
            ("Nguyễn Viết Xuân", "m", "Xuân"),
            ("Nhi Doan", "f", "Nhi"),
            ("Nhực Corn", "m", "Nhực"),
            ("Thái Sơn", "m", "Sơn"),
            ("Tuấn Bùi", "m", "Tuấn"),
        ]
    },
    {
        "num": 5,
        "name": "Đội 5",
        "short_name": "Đ5",
        "emoji": "5️⃣",
        "players": [
            ("Đồng Minh Quân", "m", "Quân"),
            ("Hạnh Phạm", "f", "Hạnh"),
            ("Lê Hồng Nhu Em", "m", "Nhu Em"),
            ("Nguyễn Ngọc Ánh Hồng", "f", "Hồng"),
            ("Phạm Ngọc Tâm", "m", "Tâm"),
            ("Tăng Anh Hào", "m", "Hào"),
        ]
    },
    {
        "num": 6,
        "name": "Đội 6",
        "short_name": "Đ6",
        "emoji": "6️⃣",
        "players": [
            ("Cường Châu", "m", "Cường"),
            ("Khánh Đào", "m", "K.Đào"),
            ("Mindy", "f", "Mindy"),
            ("Nguyễn Thanh Bình", "m", "Bình"),
            ("Nguyễn Tiến Huy", "m", "T.Huy"),
            ("Triết Trương", "m", "Triết"),
        ]
    },
]

# Matchups: 15 ties based on matrix
# Using alias names that map to full names
matchups = [
    # Đội 1 vs Đội 2
    (1, 2, [
        (1, ["Q.Long", "Sang"], ["Giang", "Tú"]),
        (2, ["Nhân", "P.Long"], ["Luân", "Thiên"]),
        (3, ["Bảo", "Thảo"], ["Giang", "Gương"]),
    ]),
    # Đội 1 vs Đội 3
    (1, 3, [
        (1, ["Bảo", "Q.Long"], ["Dũng", "Minh"]),
        (2, ["Nhân", "P.Long"], ["Huy", "Khánh"]),
        (3, ["Sang", "Thảo"], ["Đức", "Oanh"]),
    ]),
    # Đội 1 vs Đội 4
    (1, 4, [
        (1, ["Nhân", "Bảo"], ["Xuân", "An"]),
        (2, ["Q.Long", "Sang"], ["Sơn", "Nhực"]),
        (3, ["P.Long", "Thảo"], ["Tuấn", "Nhi"]),
    ]),
    # Đội 1 vs Đội 5
    (1, 5, [
        (1, ["Q.Long", "Sang"], ["Quân", "Hào"]),
        (2, ["Nhân", "P.Long"], ["Tâm", "Nhu Em"]),
        (3, ["Bảo", "Thảo"], ["Quân", "Hồng"]),
    ]),
    # Đội 1 vs Đội 6
    (1, 6, [
        (1, ["Bảo", "Q.Long"], ["Cường", "K.Đào"]),
        (2, ["Nhân", "P.Long"], ["Triết", "Bình"]),
        (3, ["Sang", "Thảo"], ["T.Huy", "Mindy"]),
    ]),

    # Đội 2 vs Đội 3
    (2, 3, [
        (1, ["Giang", "Luân"], ["Dũng", "Minh"]),
        (2, ["Tú", "Thiên"], ["Huy", "Khánh"]),
        (3, ["Giang", "Phúc"], ["Đức", "Oanh"]),
    ]),
    # Đội 2 vs Đội 4
    (2, 4, [
        (1, ["Giang", "Thiên"], ["Xuân", "Sơn"]),
        (2, ["Tú", "Luân"], ["Nhực", "Tuấn"]),
        (3, ["Tú", "Phúc"], ["An", "Nhi"]),
    ]),
    # Đội 2 vs Đội 5
    (2, 5, [
        (1, ["Giang", "Thiên"], ["Quân", "Tâm"]),
        (2, ["Tú", "Luân"], ["Hào", "Nhu Em"]),
        (3, ["Giang", "Phúc"], ["Tâm", "Hạnh"]),
    ]),
    # Đội 2 vs Đội 6
    (2, 6, [
        (1, ["Giang", "Tú"], ["Cường", "T.Huy"]),
        (2, ["Luân", "Thiên"], ["K.Đào", "Bình"]),
        (3, ["Luân", "Gương"], ["Triết", "Mindy"]),
    ]),

    # Đội 3 vs Đội 4
    (3, 4, [
        (1, ["Dũng", "Minh"], ["Xuân", "An"]),
        (2, ["Huy", "Khánh"], ["Sơn", "Nhực"]),
        (3, ["Đức", "Oanh"], ["Tuấn", "Nhi"]),
    ]),
    # Đội 3 vs Đội 5
    (3, 5, [
        (1, ["Dũng", "Minh"], ["Tâm", "Hào"]),
        (2, ["Huy", "Khánh"], ["Quân", "Nhu Em"]),
        (3, ["Đức", "Oanh"], ["Hào", "Hồng"]),
    ]),
    # Đội 3 vs Đội 6
    (3, 6, [
        (1, ["Dũng", "Minh"], ["Triết", "K.Đào"]),
        (2, ["Huy", "Khánh"], ["T.Huy", "Bình"]),
        (3, ["Đức", "Oanh"], ["Cường", "Mindy"]),
    ]),

    # Đội 4 vs Đội 5
    (4, 5, [
        (1, ["Xuân", "Tuấn"], ["Quân", "Hào"]),
        (2, ["Nhực", "An"], ["Tâm", "Nhu Em"]),
        (3, ["Sơn", "Nhi"], ["Quân", "Hạnh"]),
    ]),
    # Đội 4 vs Đội 6
    (4, 6, [
        (1, ["Xuân", "An"], ["Cường", "Triết"]),
        (2, ["Sơn", "Nhực"], ["K.Đào", "Bình"]),
        (3, ["Tuấn", "Nhi"], ["T.Huy", "Mindy"]),
    ]),

    # Đội 5 vs Đội 6
    (5, 6, [
        (1, ["Tâm", "Quân"], ["Cường", "Triết"]),
        (2, ["Hào", "Nhu Em"], ["K.Đào", "Bình"]),
        (3, ["Tâm", "Hồng"], ["T.Huy", "Mindy"]),
    ]),
]

# Map alias to variable name for each team
alias_to_var = {}
for t in teams_data:
    t_num = t["num"]
    for full_name, gender, alias in t["players"]:
        safe_name = alias.replace(".", "_").replace(" ", "_").replace("-", "_")
        var_name = f"v_p_{t_num}_{safe_name}"
        alias_to_var[(t_num, alias)] = var_name

sql_lines = []
sql_lines.append("-- Seed script for Trusting Social Badminton Tournament")
sql_lines.append(f"-- Tournament ID: {tournament_id}\n")
sql_lines.append("DO $$")
sql_lines.append("DECLARE")
sql_lines.append(f"  v_tourney_id uuid := '{tournament_id}';")
sql_lines.append("  v_group_id uuid;")
for i in range(1, 7):
    sql_lines.append(f"  v_team_{i} uuid;")
for t in teams_data:
    t_num = t["num"]
    for full_name, gender, alias in t["players"]:
        var_name = alias_to_var[(t_num, alias)]
        sql_lines.append(f"  {var_name} uuid;")
sql_lines.append("  v_tie_id uuid;")
sql_lines.append("  v_rub_1 uuid; v_rub_2 uuid; v_rub_3 uuid;")
sql_lines.append("BEGIN")

sql_lines.append("\n  -- 0. Xóa dữ liệu cũ của giải để seed lại hoàn toàn sạch sẽ")
sql_lines.append("  DELETE FROM public.ties WHERE tournament_id = v_tourney_id;")
sql_lines.append("  DELETE FROM public.teams WHERE tournament_id = v_tourney_id;")
sql_lines.append("  DELETE FROM public.tournament_groups WHERE tournament_id = v_tourney_id;\n")

# 1. Group
sql_lines.append("  -- 1. Tạo Bảng A")
sql_lines.append("  INSERT INTO public.tournament_groups(tournament_id, name, sort_order)")
sql_lines.append("  VALUES (v_tourney_id, 'Bảng A', 1)")
sql_lines.append("  RETURNING id INTO v_group_id;\n")

# 2. Teams (seed = null)
sql_lines.append("  -- 2. Tạo 6 Đội (Không hạt giống: seed = null)")
for t in teams_data:
    num = t["num"]
    name = t["name"]
    short_name = t["short_name"]
    emoji = t["emoji"]
    sql_lines.append(f"  INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)")
    sql_lines.append(f"  VALUES (v_tourney_id, v_group_id, '{name}', '{short_name}', '{emoji}', null)")
    sql_lines.append(f"  RETURNING id INTO v_team_{num};")

# 3. Players with full names and gender
sql_lines.append("\n  -- 3. Tạo Vận động viên cho từng đội (Đầy đủ họ tên, giới tính)")
for t in teams_data:
    t_num = t["num"]
    sql_lines.append(f"\n  -- VĐV Đội {t_num}")
    for idx, (full_name, gender, alias) in enumerate(t["players"]):
        var_name = alias_to_var[(t_num, alias)]
        sql_lines.append(f"  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)")
        sql_lines.append(f"  VALUES (v_tourney_id, v_team_{t_num}, '{full_name}', '{gender}', {idx + 1})")
        sql_lines.append(f"  RETURNING id INTO {var_name};")

# 4. Ties and Lineups
sql_lines.append("\n  -- 4. Tạo 15 Trận đồng đội (Ties) và Lineup theo ma trận 3 sân song song")
for tie_idx, (tA, tB, rubbers) in enumerate(matchups, 1):
    sql_lines.append(f"\n  -- Tie #{tie_idx}: Đội {tA} vs Đội {tB}")
    sql_lines.append("  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)")
    sql_lines.append(f"  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội {tA} vs Đội {tB}', {tie_idx}, v_team_{tA}, v_team_{tB}, 'Sân 1, 2, 3')")
    sql_lines.append("  RETURNING id INTO v_tie_id;\n")

    # Update rubbers court
    sql_lines.append("  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;")
    sql_lines.append("  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;")
    sql_lines.append("  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;")

    # Lineups for each rubber
    for pos, sideA_players, sideB_players in rubbers:
        rub_var = f"v_rub_{pos}"
        # Side A
        for p in sideA_players:
            p_var = alias_to_var[(tA, p)]
            sql_lines.append(f"  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, {rub_var}, 'a', {p_var});")
        # Side B
        for p in sideB_players:
            p_var = alias_to_var[(tB, p)]
            sql_lines.append(f"  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, {rub_var}, 'b', {p_var});")

sql_lines.append("\n  RAISE NOTICE 'Đã cập nhật thành công 6 đội, 36 vận động viên chuẩn xác, bỏ hạt giống và tạo đầy đủ 15 trận cho giải %!', v_tourney_id;")
sql_lines.append("END $$;")

with open('supabase/seed_ts_tournament.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines) + '\n')

print("Generated updated supabase/seed_ts_tournament.sql successfully!")
